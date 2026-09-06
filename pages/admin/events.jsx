import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function EventManager() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        location: '',
        status: 'published'
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            // Re-using the public endpoint which fetches all published events.
            // In a real admin panel, we'd use an admin-specific endpoint that includes drafts.
            const res = await fetch('/api/events');
            const data = await res.json();
            if (Array.isArray(data)) {
                setEvents(data);
            } else {
                setEvents([]);
            }
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteEvent = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                fetchEvents();
            } else {
                alert('Failed to delete event');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFormChange = (e) => {
        const { id, value } = e.target;
        if (id === 'eventDate') setFormData(prev => ({ ...prev, event_date: value }));
        else setFormData(prev => ({ ...prev, [id.replace('event', '').toLowerCase()]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ title: '', description: '', event_date: '', location: '', status: 'published' });
                fetchEvents();
            } else {
                const data = await res.json();
                alert(`Failed to save event: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while saving.');
        }
    };

    return (
        <AdminLayout title="Manage Events">
            <div className="content-header" style={{ marginBottom: '20px' }}>
                <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <i className="fas fa-plus"></i> Add New Event
                    </button>
                </div>
            </div>

            <div className="events-table-container" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '12px' }}>Title</th>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Location</th>
                            <th style={{ padding: '12px' }}>RSVPs</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Loading events...</td></tr>
                        ) : events.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No events found.</td></tr>
                        ) : (
                            events.map(event => (
                                <tr key={event.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{event.title}</td>
                                    <td style={{ padding: '12px' }}>{new Date(event.start_time).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>{event.location || 'N/A'}</td>
                                    <td style={{ padding: '12px' }}>{event.rsvps || 0}</td>
                                    <td style={{ padding: '12px' }}>
                                        <button className="btn btn-sm" style={{ marginRight: '8px', background: '#f3f4f6', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-sm" onClick={() => deleteEvent(event.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/*  Event Editor Modal  */}
            {isModalOpen && (
                <div className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto', width: '500px' }}>
                        <div className="modal-header">
                            <h2>Add New Event</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form id="eventForm" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="eventTitle">Title</label>
                                    <input type="text" id="eventTitle" required value={formData.title} onChange={handleFormChange} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="eventDate">Date & Time</label>
                                    <input type="datetime-local" id="eventDate" required value={formData.event_date} onChange={handleFormChange} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="eventLocation">Location</label>
                                    <input type="text" id="eventLocation" value={formData.location} onChange={handleFormChange} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="eventDescription">Description</label>
                                    <textarea id="eventDescription" rows="4" value={formData.description} onChange={handleFormChange}></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" form="eventForm" className="btn btn-primary">Save Event</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
