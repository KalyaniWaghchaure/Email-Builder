import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmailBuilder.css';

const EmailBuilder = () => {
  const [template, setTemplate] = useState('');
  const [emailConfig, setEmailConfig] = useState({
    title: '',
    content: '',
    footer: '',
    imageUrl: ''
  });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    fetchEmailLayout();
  }, []);

  const fetchEmailLayout = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getEmailLayout');
      setTemplate(response.data);
    } catch (error) {
      console.error('Error fetching template:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:3001/api/uploadImage', formData);
      setEmailConfig(prev => ({
        ...prev,
        imageUrl: response.data.imageUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Save email configuration
      await axios.post('http://localhost:3001/api/uploadEmailConfig', emailConfig);

      // Generate preview
      const response = await axios.post('http://localhost:3001/api/renderAndDownloadTemplate', emailConfig);
      setPreview(response.data);
    } catch (error) {
      console.error('Error generating template:', error);
    }
  };

  return (
    <div className="email-builder">
      <div className="editor-section">
        <h2>Email Builder</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={emailConfig.title}
              onChange={handleInputChange}
              placeholder="Enter email title"
            />
          </div>

          <div className="form-group">
            <label>Content:</label>
            <textarea
              name="content"
              value={emailConfig.content}
              onChange={handleInputChange}
              placeholder="Enter email content"
              rows="6"
            />
          </div>

          <div className="form-group">
            <label>Footer:</label>
            <input
              type="text"
              name="footer"
              value={emailConfig.footer}
              onChange={handleInputChange}
              placeholder="Enter footer text"
            />
          </div>

          <div className="form-group">
            <label>Image:</label>
            <input
              type="file"
              onChange={handleFileUpload}
              accept="image/*"
            />
          </div>

          <button type="submit" className="generate-btn">
            Generate Template
          </button>
        </form>
      </div>

      {preview && (
        <div className="preview-section">
          <h3>Preview</h3>
          <div 
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: preview }} 
          />
        </div>
      )}
    </div>
  );
};

export default EmailBuilder;