import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({}); 

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
  });

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [editErrors, setEditErrors] = useState({}); 

  const fetchCustomers = useCallback(
    async (page = 1) => {
      const res = await axios.get(`${API_URL}/customers`, {
        params: { search, page },
      });

      setCustomers(res.data.data);
      setPagination({
        currentPage: res.data.pagination.current_page,
        lastPage: res.data.pagination.last_page,
      });
    },
    [search]
  );

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const validateCustomer = (customer) => {
    let errs = {};
    if (!customer.name.trim()) {
      errs.name = "Name is required";
    }
    if (!customer.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errs.email = "Invalid email format";
    }
    if (!customer.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(customer.phone)) {
      errs.phone = "Phone must be 10 digits";
    }
    return errs;
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    await axios.post(`${API_URL}/customers/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Import successful!");
    setFile(null);
    setFileInputKey(Date.now());
    fetchCustomers();
  };

  const handleExport = () => {
    window.location.href = `${API_URL}/customers/export`;
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();

    const validationErrors = validateCustomer(newCustomer);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      await axios.post(`${API_URL}/customers`, newCustomer);
      setNewCustomer({ name: "", email: "", phone: "" });
      fetchCustomers();
    } catch (err) {
      alert("Error adding customer");
    }
  };

  const handleDeleteCustomer = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete?");
    if (!isConfirmed) return;

    await axios.delete(`${API_URL}/customers/${id}`);
    fetchCustomers();
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer.id);
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
    setEditErrors({});
  };

  const handleUpdateCustomer = async (id) => {
    const validationErrors = validateCustomer(editForm);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }
    setEditErrors({});

    try {
      await axios.put(`${API_URL}/customers/${id}`, editForm);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      alert("Error updating customer");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Customer Management</h1>

      <form onSubmit={handleAddCustomer} className="mb-4">
        <input
          type="text"
          className="border p-2 mr-2"
          placeholder="Name"
          value={newCustomer.name}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, name: e.target.value })
          }
        />
        {errors.name && <span className="text-red-500">{errors.name}</span>}

        <input
          type="email"
          className="border p-2 mr-2"
          placeholder="Email"
          value={newCustomer.email}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, email: e.target.value })
          }
        />
        {errors.email && <span className="text-red-500">{errors.email}</span>}

        <input
          type="text"
          className="border p-2 mr-2"
          placeholder="Phone"
          value={newCustomer.phone}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, phone: e.target.value })
          }
        />
        {errors.phone && <span className="text-red-500">{errors.phone}</span>}

        <button type="submit" className="bg-blue-500 text-white px-3 py-1 ml-2">
          Add Customer
        </button>
      </form>

      <input
        type="text"
        placeholder="Search by name, email, phone"
        className="border p-2 mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <form onSubmit={handleImport} className="mb-4">
        <input
          key={fileInputKey}
          type="file"
          accept=".xlsx,.csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-3 py-1 ml-2"
        >
          Import
        </button>
      </form>

      <button
        onClick={handleExport}
        className="bg-blue-500 text-white px-3 py-1 mb-4"
      >
        Export
      </button>

      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map((c) => (
              <tr key={c.id}>
                <td className="border p-2">
                  {editingCustomer === c.id ? (
                    <>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="border p-1"
                      />
                      {editErrors.name && (
                        <span className="text-red-500">{editErrors.name}</span>
                      )}
                    </>
                  ) : (
                    c.name
                  )}
                </td>
                <td className="border p-2">
                  {editingCustomer === c.id ? (
                    <>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="border p-1"
                      />
                      {editErrors.email && (
                        <span className="text-red-500">{editErrors.email}</span>
                      )}
                    </>
                  ) : (
                    c.email
                  )}
                </td>
                <td className="border p-2">
                  {editingCustomer === c.id ? (
                    <>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="border p-1"
                      />
                      {editErrors.phone && (
                        <span className="text-red-500">{editErrors.phone}</span>
                      )}
                    </>
                  ) : (
                    c.phone
                  )}
                </td>
                <td className="border p-2">
                  {editingCustomer === c.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateCustomer(c.id)}
                        className="bg-green-500 text-white px-2 py-1 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCustomer(null)}
                        className="bg-gray-500 text-white px-2 py-1"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(c)}
                        className="bg-yellow-500 text-white px-2 py-1 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(c.id)}
                        className="bg-red-500 text-white px-2 py-1"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No customers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between">
        <button
          onClick={() => fetchCustomers(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="bg-gray-500 text-white px-3 py-1"
        >
          Previous
        </button>
        <button
          onClick={() => fetchCustomers(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.lastPage}
          className="bg-gray-500 text-white px-3 py-1"
        >
          Next
        </button>
      </div>
    </div>
  );
}
