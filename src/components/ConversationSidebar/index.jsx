'use client';
import { useState, useEffect } from 'react';
import { 
  Button, Form, InputGroup, ListGroup, 
  Modal, Spinner, Badge, Offcanvas
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  getAllConversations,
  createConversation,
  renameConversation,
  deleteConversation,
  searchConversations
} from '@/lib/api/conversations';
import './styles.css';

export default function ConversationSidebar({ 
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  isMobile = false,
  show = true,
  onHide = () => {}
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await getAllConversations();
      setConversations(data.conversations || data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadConversations();
      return;
    }
    
    try {
      const data = await searchConversations(query);
      setConversations(data.conversations || data || []);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await createConversation({ title: 'New conversation' });
      setConversations(prev => [newConv.conversation || newConv, ...prev]);
      onNewConversation?.(newConv.conversation || newConv);
      if (isMobile) onHide();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleRename = async () => {
    if (!selectedConversation || !newTitle.trim()) return;
    
    try {
      await renameConversation(selectedConversation.id, newTitle);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, title: newTitle }
            : conv
        )
      );
      setShowRenameModal(false);
      setNewTitle('');
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedConversation) return;
    
    try {
      await deleteConversation(selectedConversation.id);
      setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
      setShowDeleteModal(false);
      
      // If deleted conversation was active, create a new one
      if (selectedConversation.id === currentConversationId) {
        handleNewConversation();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const openRenameModal = (conversation, e) => {
    e.stopPropagation();
    setSelectedConversation(conversation);
    setNewTitle(conversation.title || '');
    setShowRenameModal(true);
  };

  const openDeleteModal = (conversation, e) => {
    e.stopPropagation();
    setSelectedConversation(conversation);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const SidebarContent = () => (
    <div className="conversation-sidebar h-100 d-flex flex-column">
      {/* Header */}
      <div className="sidebar-header p-3 border-bottom">
        <Button 
          variant="primary" 
          className="w-100 mb-3"
          onClick={handleNewConversation}
        >
          <IconifyIcon icon="ri:add-line" className="me-2" />
          New Conversation
        </Button>

        {/* Search */}
        <InputGroup size="sm">
          <InputGroup.Text>
            <IconifyIcon icon="ri:search-line" />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Conversations List */}
      <div className="sidebar-content flex-grow-1 overflow-auto p-2">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <IconifyIcon icon="ri:chat-3-line" style={{ fontSize: '3rem' }} />
            <p className="mt-3 small">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {conversations.map((conv) => (
              <ListGroup.Item
                key={conv.id}
                active={conv.id === currentConversationId}
                onClick={() => {
                  onConversationSelect?.(conv);
                  if (isMobile) onHide();
                }}
                className="conversation-item cursor-pointer border-0 rounded mb-1"
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-start">
                  <div className="flex-grow-1 me-2">
                    <div className="d-flex align-items-center mb-1">
                      <IconifyIcon 
                        icon="ri:chat-3-line" 
                        className="me-2 text-muted" 
                        style={{ fontSize: '1rem' }}
                      />
                      <strong className="small text-truncate">
                        {conv.title || 'Untitled conversation'}
                      </strong>
                    </div>
                    <small className="text-muted d-block">
                      {formatDate(conv.updated_at || conv.created_at)}
                    </small>
                    {conv.message_count > 0 && (
                      <Badge bg="secondary" className="mt-1" style={{ fontSize: '0.65rem' }}>
                        {conv.message_count} messages
                      </Badge>
                    )}
                  </div>
                  
                  <div className="conversation-actions d-flex gap-1">
                    <Button
                      variant="link"
                      size="sm"
                      className="p-1 text-muted"
                      onClick={(e) => openRenameModal(conv, e)}
                      title="Rename"
                    >
                      <IconifyIcon icon="ri:edit-line" style={{ fontSize: '0.9rem' }} />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-1 text-danger"
                      onClick={(e) => openDeleteModal(conv, e)}
                      title="Delete"
                    >
                      <IconifyIcon icon="ri:delete-bin-line" style={{ fontSize: '0.9rem' }} />
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>
    </div>
  );

  // Mobile: Offcanvas
  if (isMobile) {
    return (
      <>
        <Offcanvas show={show} onHide={onHide} placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Conversations</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <SidebarContent />
          </Offcanvas.Body>
        </Offcanvas>

        {/* Modals */}
        <RenameModal />
        <DeleteModal />
      </>
    );
  }

  // Desktop: Regular sidebar
  const RenameModal = () => (
    <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Rename Conversation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>New Title</Form.Label>
          <Form.Control
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new title..."
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleRename()}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowRenameModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleRename} disabled={!newTitle.trim()}>
          <IconifyIcon icon="ri:save-line" className="me-2" />
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const DeleteModal = () => (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Conversation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this conversation?</p>
        <p className="text-muted small mb-0">
          <strong>{selectedConversation?.title || 'Untitled conversation'}</strong>
        </p>
        <p className="text-danger small mt-2">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          <IconifyIcon icon="ri:delete-bin-line" className="me-2" />
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      <div className="h-100 border-end bg-light" style={{ width: '280px' }}>
        <SidebarContent />
      </div>
      
      {/* Modals */}
      <RenameModal />
      <DeleteModal />
    </>
  );
}

