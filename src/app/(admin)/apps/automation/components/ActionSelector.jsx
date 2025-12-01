'use client';

import { useState } from 'react';
import { Modal, Form, Card, CardBody, Row, Col, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

export default function ActionSelector({ show, onHide, actionTypes, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Actions', icon: 'ri:list-check' },
    { value: 'ai', label: 'AI-Powered', icon: 'ri:sparkling-line', color: 'primary' },
    { value: 'outbound', label: 'Outbound Email', icon: 'ri:mail-send-line', color: 'success' },
    { value: 'basic', label: 'Basic Actions', icon: 'ri:settings-line', color: 'secondary' },
  ];

  const filteredActions = actionTypes.filter(action => {
    const matchesSearch = action.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (actionType) => {
    onSelect(actionType);
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title>
          <IconifyIcon icon="ri:add-circle-line" className="me-2" />
          Add Action to Workflow
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Search Bar */}
        <Form.Group className="mb-4">
          <div className="position-relative">
            <IconifyIcon 
              icon="ri:search-line" 
              className="position-absolute text-muted"
              style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}
            />
            <Form.Control
              type="text"
              placeholder="Search actions... (e.g., 'AI', 'email', 'bulk')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', height: '48px', fontSize: '1rem' }}
              autoFocus
            />
          </div>
        </Form.Group>

        {/* Category Filter */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat.value}
              bg={selectedCategory === cat.value ? (cat.color || 'dark') : 'light'}
              text={selectedCategory === cat.value ? 'white' : 'dark'}
              className="px-3 py-2 cursor-pointer border"
              style={{ cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={() => setSelectedCategory(cat.value)}
            >
              <IconifyIcon icon={cat.icon} className="me-1" />
              {cat.label}
            </Badge>
          ))}
        </div>

        {/* Action Cards Grid */}
        {filteredActions.length === 0 ? (
          <div className="text-center py-5">
            <IconifyIcon 
              icon="ri:search-line" 
              style={{ fontSize: '3rem', opacity: 0.3 }}
            />
            <p className="text-muted mt-3">No actions found matching "{searchTerm}"</p>
          </div>
        ) : (
          <Row>
            {filteredActions.map((actionType) => {
              const isAI = actionType.category === 'ai';
              const isOutbound = actionType.category === 'outbound';
              
              return (
                <Col key={actionType.value} md={6} lg={4} className="mb-3">
                  <Card 
                    className={`h-100 cursor-pointer action-card ${
                      isAI ? 'border-primary' : 
                      isOutbound ? 'border-success' : 
                      'border-secondary'
                    }`}
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      borderWidth: '2px'
                    }}
                    onClick={() => handleSelect(actionType.value)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <CardBody>
                      <div className="text-center mb-3">
                        <div 
                          className={`d-inline-flex align-items-center justify-content-center rounded-circle ${
                            isAI ? 'bg-primary bg-opacity-10' :
                            isOutbound ? 'bg-success bg-opacity-10' :
                            'bg-secondary bg-opacity-10'
                          }`}
                          style={{ width: '64px', height: '64px' }}
                        >
                          <IconifyIcon
                            icon={actionType.icon}
                            className={
                              isAI ? 'text-primary' :
                              isOutbound ? 'text-success' :
                              'text-secondary'
                            }
                            style={{ fontSize: '2rem' }}
                          />
                        </div>
                      </div>
                      
                      <h6 className="text-center mb-2">
                        {actionType.label}
                      </h6>
                      
                      {actionType.description && (
                        <p className="text-muted small text-center mb-3" style={{ minHeight: '40px' }}>
                          {actionType.description}
                        </p>
                      )}
                      
                      <div className="text-center">
                        <Badge 
                          bg={
                            isAI ? 'primary' :
                            isOutbound ? 'success' :
                            'secondary'
                          }
                          className="px-2 py-1"
                        >
                          {actionType.category}
                        </Badge>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
}

