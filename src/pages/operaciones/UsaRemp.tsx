import { useState, useEffect } from 'react';
import { Button, Spin, Input, Modal } from 'antd';
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import { operacionesService } from '@/services/operacionesService';
import Swal from 'sweetalert2';
import './Descuentos.css';

export const UsaRemp = () => {
  const [loading, setLoading] = useState(false);
  const [guias, setGuias] = useState<any[]>([]);
  const [filteredGuias, setFilteredGuias] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    document.title = 'Sistema Entregax | USA REMP.';
    loadGuias();
  }, []);

  const loadGuias = async () => {
    try {
      setLoading(true);
      const data = await operacionesService.getListReempaque();
      setGuias(data);
      setFilteredGuias(data);
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Error al cargar las guías USA REMP.',
        showConfirmButton: false,
        timer: 3500
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGuias(guias);
    } else {
      const needle = searchTerm.toLowerCase();
      const filtered = guias.filter((guia) => 
        String(guia.guiaingreso ?? '').toLowerCase().includes(needle) ||
        String(guia.guiaunica ?? '').toLowerCase().includes(needle) ||
        String(guia.suite ?? '').toLowerCase().includes(needle)
      );
      setFilteredGuias(filtered);
    }
    setPage(1);
  }, [searchTerm, guias]);

  const handleGuias = async (guia: any) => {
    try {
      setLoadingModal(true);
      const response = await operacionesService.viewWaybillsReempaque({
        id: guia.id,
        idu: guia.idu
      });

      const isSuccess = response?.status === 'success';
      
      if (!isSuccess) {
        const errorMessage = response?.message || 'Error al cargar las guías';
        Swal.fire({
          icon: 'error',
          title: '',
          text: errorMessage,
          showConfirmButton: false,
          timer: 3500
        });
        return;
      }

      // Obtener los datos del reempaque
      const data = response?.data ?? [];
      setModalData(Array.isArray(data) ? data : []);
      setIsModalVisible(true);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || 'Error al cargar las guías';
      Swal.fire({
        icon: 'error',
        title: '',
        text: errorMessage,
        showConfirmButton: false,
        timer: 3500
      });
    } finally {
      setLoadingModal(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setModalData([]);
  };

  // Formatear fecha al formato español
  const formatDateToSpanish = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Calcular datos paginados
  const totalRecords = filteredGuias.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = filteredGuias.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          backgroundColor: '#4a4a4a', 
          color: 'white',
          padding: '24px',
        }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            USA REMP.
          </h1>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            {/* Búsqueda */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center',
              marginBottom: '20px',
              gap: '8px'
            }}>
              <span style={{ fontWeight: 500, color: '#666' }}>Buscar:</span>
              <Input
                placeholder="Buscar por guía o SUITE..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '300px' }}
                size="large"
              />
            </div>

            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Guía de Ingreso</th>
                    <th>Guía Única</th>
                    <th>SUITE</th>
                    <th>Tipo de Cambio</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No hay registros para mostrar
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((guia) => (
                      <tr key={guia.id}>
                        <td style={{ padding: '12px 16px', color: '#333' }}>
                          {guia.guiaingreso}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#333' }}>
                          {guia.guiaunica}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#333', fontWeight: 500 }}>
                          {guia.suite}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#333' }}>
                          ${guia.tipodecambio}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#333' }}>
                          {formatDateToSpanish(guia.created)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Button
                            type="primary"
                            icon={<FileTextOutlined />}
                            onClick={() => handleGuias(guia)}
                            loading={loadingModal}
                            style={{
                              backgroundColor: '#ff6600',
                              borderColor: '#ff6600',
                            }}
                          >
                            Guías
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalRecords > 0 && (
              <div className="table-footer">
                <div className="records-info">
                  Mostrando {totalRecords > 0 ? startIndex + 1 : 0} a {endIndex} de {totalRecords} registros
                </div>
                <div className="pagination-buttons">
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Guías del Reempaque */}
      <Modal
        title={
          <div style={{ 
            backgroundColor: '#1e40af', 
            color: 'white',
            margin: '-20px -24px 20px -24px',
            padding: '20px 24px',
            fontSize: '18px',
            fontWeight: 600
          }}>
            Guías del REEMPAQUE
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button 
            key="close" 
            onClick={handleCloseModal}
            style={{
              backgroundColor: '#dc2626',
              borderColor: '#dc2626',
              color: 'white',
              fontWeight: 500,
              height: '40px',
              padding: '0 32px'
            }}
          >
            Cerrar
          </Button>
        ]}
        width={1000}
        centered
      >
        {loadingModal ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Guía de Ingreso</th>
                  <th>Guía NACIONAL</th>
                  <th>Guía Única</th>
                  <th>Dimensiones</th>
                  <th>Peso</th>
                  <th>CBM</th>
                </tr>
              </thead>
              <tbody>
                {modalData.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      No hay guías para mostrar
                    </td>
                  </tr>
                ) : (
                  modalData.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px 16px', color: '#1e40af', fontWeight: 500 }}>
                        {item.guiaingreso || ''}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#333' }}>
                        {item.guiaus || ''}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#333' }}>
                        {item.guiaunica || ''}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#333' }}>
                        {item.dimensiones || '0 x 0 x 0'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#333' }}>
                        {item.peso || '0'} kg
                      </td>
                      <td style={{ padding: '12px 16px', color: '#333' }}>
                        {item.cbm || '0'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsaRemp;
