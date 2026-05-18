import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import './Request.css';

function Request() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    pickupDate: '',
    timeSlot: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    loadTimeSlots(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (formData.pickupDate) {
      loadTimeSlots(formData.pickupDate);
    }
  }, [formData.pickupDate]);

  const loadTimeSlots = async (date) => {
    if (!date) return;
    
    setIsLoadingTimeSlots(true);
    try {
      const slots = await dataService.getTimeSlots(date);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error loading time slots:', error);
      setTimeSlots([
        { id: '1', slot: '8:00 AM - 10:00 AM', available: true },
        { id: '2', slot: '10:00 AM - 12:00 PM', available: true },
        { id: '3', slot: '12:00 PM - 2:00 PM', available: true },
        { id: '4', slot: '2:00 PM - 4:00 PM', available: true },
        { id: '5', slot: '4:00 PM - 6:00 PM', available: true },
      ]);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'mobile':
        if (!value.trim()) {
          newErrors.mobile = 'Mobile number is required';
        } else if (!/^\d{10,15}$/.test(value.trim())) {
          newErrors.mobile = 'Enter a valid mobile number (10-15 digits)';
        } else {
          delete newErrors.mobile;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          newErrors.email = 'Enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'address':
        if (!value.trim()) {
          newErrors.address = 'Address is required';
        } else if (value.trim().length < 10) {
          newErrors.address = 'Please provide a complete address';
        } else {
          delete newErrors.address;
        }
        break;
      case 'pickupDate':
        if (!value.trim()) {
          newErrors.pickupDate = 'Pickup date is required';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (isNaN(selectedDate.getTime())) {
            newErrors.pickupDate = 'Please enter a valid date';
          } else if (selectedDate < today) {
            newErrors.pickupDate = 'Pickup date cannot be in the past';
          } else {
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 30);
            if (selectedDate > maxDate) {
              newErrors.pickupDate = 'Pickup date cannot be more than 30 days from today';
            } else {
              delete newErrors.pickupDate;
            }
          }
        }
        break;
      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Description is required';
        } else if (value.trim().length < 10) {
          newErrors.description = 'Please provide more details about your scrap';
        } else {
          delete newErrors.description;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
    validateField(field, value);
  };

  const formatDateForInput = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextSevenDays = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return days;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });

    if (!formData.timeSlot) {
      setErrors(prev => ({ ...prev, timeSlot: 'Please select a time slot' }));
    }

    // Check if there are any errors
    const hasErrors = Object.keys(errors).length > 0 || !formData.timeSlot;
    if (hasErrors) {
      alert('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        name: formData.name.trim(),
        mobile_No: formData.mobile.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        pickUp_Date: formData.pickupDate.trim(),
        time_slot: formData.timeSlot,
        description: formData.description.trim()
      };

      const result = await dataService.submitUserRequest(requestData);

      if (result.success) {
        setShowSuccess(true);
        resetForm();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      mobile: '',
      email: '',
      address: '',
      pickupDate: '',
      timeSlot: '',
      description: ''
    });
    setErrors({});
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    navigate('/');
  };

  return (
    <div className="request-container">
      <header className="header">
        <nav className="navbar">
          <div className="logo">♻ ScrapWale</div>
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </nav>
      </header>

      <div className="booking-container">
        <div className="icon-header">
          <span className="trash-icon">🗑️</span>
        </div>

        <h1 className="page-title">Scrap Collection Booking</h1>
        <p className="page-subtitle">Schedule a pickup for your recyclable materials</p>

        <form className="booking-form" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Mobile and Email */}
          <div className="form-row">
            <div className="form-group-half">
              <label className="form-label">Mobile No *</label>
              <input
                type="tel"
                className={`form-input ${errors.mobile ? 'error' : ''}`}
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) => updateFormData('mobile', e.target.value)}
              />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>

            <div className="form-group-half">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea
              className={`form-input text-area ${errors.address ? 'error' : ''}`}
              placeholder="Enter your complete address with landmarks"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
              rows="3"
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {/* Pickup Date and Time Slot */}
          <div className="form-row">
            <div className="form-group-half">
              <label className="form-label">Pickup Date *</label>
              
              {/* Quick Date Selection */}
              <div className="quick-date-container">
                {getNextSevenDays().slice(0, 3).map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`quick-date-button ${formData.pickupDate === day.value ? 'active' : ''}`}
                    onClick={() => updateFormData('pickupDate', day.value)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>

              {/* Date Input */}
              <input
                type="date"
                className={`form-input ${errors.pickupDate ? 'error' : ''}`}
                value={formData.pickupDate}
                onChange={(e) => updateFormData('pickupDate', e.target.value)}
                min={formatDateForInput()}
              />
              {errors.pickupDate && <span className="error-text">{errors.pickupDate}</span>}
              {!errors.pickupDate && (
                <span className="helper-text">
                  📅 Select a date from tomorrow up to 30 days ahead
                </span>
              )}
            </div>

            <div className="form-group-half">
              <label className="form-label">Time Slot *</label>
              {isLoadingTimeSlots ? (
                <div className="loading-slots">
                  <p>Loading available slots...</p>
                </div>
              ) : (
                <div className="time-slots-container">
                  {timeSlots.map((slot, index) => {
                    const isSelected = formData.timeSlot === slot.slot;
                    const isAvailable = slot.available;
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`time-slot-button ${isSelected ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                        onClick={() => {
                          if (isAvailable) {
                            setFormData({...formData, timeSlot: slot.slot});
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.timeSlot;
                              return newErrors;
                            });
                          }
                        }}
                        disabled={!isAvailable}
                      >
                        <span className="time-slot-text">{slot.slot}</span>
                        {!isAvailable && <span className="unavailable-badge">Full</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.timeSlot && <span className="error-text">{errors.timeSlot}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className={`form-input text-area ${errors.description ? 'error' : ''}`}
              placeholder="Describe the type and quantity of scrap materials (e.g., 10kg newspapers, 5kg plastic bottles)"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              rows="4"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-small"></span>
                Submitting...
              </>
            ) : (
              '📅 Book Pickup'
            )}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay" onClick={closeSuccessModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">✅</div>
            <h2 className="modal-title">Success!</h2>
            <p className="modal-message">
              Your scrap collection has been booked successfully! We'll contact you within 24 hours to confirm the details.
            </p>
            <div className="modal-buttons">
              <button className="modal-button primary" onClick={closeSuccessModal}>
                Go to Home
              </button>
              <button className="modal-button secondary" onClick={() => {
                setShowSuccess(false);
                resetForm();
              }}>
                Book Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Request;
