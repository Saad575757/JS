'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  Table,
  Badge,
  Alert,
  Spinner,
  Pagination,
  Row,
  Col,
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAgentExecutions, getAgentStats } from '@/lib/api/automation';

export default function ExecutionHistory({ agentId, onBack }) {
  const [executions, setExecutions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [agentId, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load executions
      const executionsData = await getAgentExecutions(agentId, {
        page: currentPage,
        limit: 10,
      });
      setExecutions(executionsData.executions || []);
      setTotalPages(executionsData.totalPages || 1);

      // Load stats
      const statsData = await getAgentStats(agentId);
      setStats(statsData.stats || null);
    } catch (err) {
      console.error('Error loading execution data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status) => {
    const variants = {
      success: 'success',
      failed: 'danger',
      running: 'primary',
      pending: 'warning',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="mb-4">
        <Button variant="link" onClick={onBack} className="p-0 mb-2">
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
          Back to Agents
        </Button>
        <h4 className="mb-0">Execution History</h4>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <CardBody>
                <IconifyIcon
                  icon="ri:play-circle-line"
                  className="text-primary mb-2"
                  style={{ fontSize: '2rem' }}
                />
                <h3 className="mb-0">{stats.totalExecutions || 0}</h3>
                <small className="text-muted">Total Executions</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <CardBody>
                <IconifyIcon
                  icon="ri:checkbox-circle-line"
                  className="text-success mb-2"
                  style={{ fontSize: '2rem' }}
                />
                <h3 className="mb-0">{stats.successfulExecutions || 0}</h3>
                <small className="text-muted">Successful</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <CardBody>
                <IconifyIcon
                  icon="ri:close-circle-line"
                  className="text-danger mb-2"
                  style={{ fontSize: '2rem' }}
                />
                <h3 className="mb-0">{stats.failedExecutions || 0}</h3>
                <small className="text-muted">Failed</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <CardBody>
                <IconifyIcon
                  icon="ri:percent-line"
                  className="text-info mb-2"
                  style={{ fontSize: '2rem' }}
                />
                <h3 className="mb-0">
                  {stats.totalExecutions > 0
                    ? Math.round((stats.successfulExecutions / stats.totalExecutions) * 100)
                    : 0}
                  %
                </h3>
                <small className="text-muted">Success Rate</small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Executions Table */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading execution history...</p>
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-5">
              <IconifyIcon
                icon="ri:history-line"
                style={{ fontSize: '4rem', opacity: 0.3 }}
              />
              <h5 className="mt-3">No executions yet</h5>
              <p className="text-muted">
                Execution history will appear here once workflows are triggered
              </p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Workflow</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Duration</th>
                    <th>Actions</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((execution) => (
                    <tr key={execution.id}>
                      <td>
                        <strong>{execution.workflowName || 'Unknown'}</strong>
                        <br />
                        <small className="text-muted">
                          ID: {execution.id}
                        </small>
                      </td>
                      <td>{getStatusBadge(execution.status)}</td>
                      <td>
                        <small>{formatDate(execution.startedAt)}</small>
                      </td>
                      <td>
                        {execution.completedAt && execution.startedAt ? (
                          <small>
                            {Math.round(
                              (new Date(execution.completedAt) -
                                new Date(execution.startedAt)) /
                                1000
                            )}
                            s
                          </small>
                        ) : (
                          <small className="text-muted">-</small>
                        )}
                      </td>
                      <td>
                        <small>
                          {execution.actionsExecuted || 0} /{' '}
                          {execution.totalActions || 0}
                        </small>
                      </td>
                      <td>
                        {execution.error && (
                          <small className="text-danger">
                            <IconifyIcon icon="ri:error-warning-line" className="me-1" />
                            {execution.error.substring(0, 50)}
                            {execution.error.length > 50 && '...'}
                          </small>
                        )}
                        {execution.result && !execution.error && (
                          <small className="text-success">
                            <IconifyIcon icon="ri:checkbox-circle-line" className="me-1" />
                            Completed successfully
                          </small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

