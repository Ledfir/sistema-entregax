import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Badge, Input, Modal, Timeline } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckOutlined, SearchOutlined, FileTextOutlined, FileExcelOutlined, FilePdfOutlined, ClockCircleOutlined, UnorderedListOutlined, InboxOutlined } from '@ant-design/icons';
import ticketsService from '@/services/ticketsService';
import Swal from 'sweetalert2';
import './Tickets.css';

interface TicketResponse {
  token: string;
  name: string;
  category: string;
  state: string;
  created: string;
  designado: string;
  asesor: string;
  place: string;
  suite: string;
  cliente: string;
}

interface Ticket {
  token: string;
  ticket: string;
  cliente: string;
  asesor: string;
  informacion: string;
  estatus: string;
  designado: string;
  responsable: string;
  creado: string;
  suite: string;
  ubicacion: 'MONTERREY' | 'GUADALAJARA' | 'CIUDAD DE MEXICO' | 'CHINA' | 'USA';
}

const ubicacionColors = {
  'MONTERREY': '#FF8C42',
  'GUADALAJARA': '#D98DCE',
  'CIUDAD DE MEXICO': '#90EE90',
  'CHINA': '#FFD700',
  'USA': '#6495ED',
};

export const TicketsActivos = () => {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [timelineModalVisible, setTimelineModalVisible] = useState(false);
  const [subestadosModalVisible, setSubestadosModalVisible] = useState(false);
  const [detallesModalVisible, setDetallesModalVisible] = useState(false);
  const [evidenciasModalVisible, setEvidenciasModalVisible] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  const [ticketDetalles, setTicketDetalles] = useState<any>(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [ticketEvidencias, setTicketEvidencias] = useState<any[]>([]);
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);
  const [referencesModalVisible, setReferencesModalVisible] = useState(false);
  const [ticketReferences, setTicketReferences] = useState<any[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [newReference, setNewReference] = useState('');

  useEffect(() => {
    document.title = 'Tickets Activos';
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsService.getTicketsActivos();
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        // Transformar los datos del servidor al formato del frontend
        const ticketsTransformados: Ticket[] = response.data.map((item: TicketResponse) => {
          // Normalizar ubicación
          let ubicacionNormalizada: Ticket['ubicacion'] = 'MONTERREY';
          const placeUpper = item.place?.toUpperCase() || '';
          
          if (placeUpper.includes('MONTERREY')) {
            ubicacionNormalizada = 'MONTERREY';
          } else if (placeUpper.includes('GUADALAJARA')) {
            ubicacionNormalizada = 'GUADALAJARA';
          } else if (placeUpper.includes('CDMX') || placeUpper.includes('MEXICO') || placeUpper.includes('CIUDAD DE MEXICO')) {
            ubicacionNormalizada = 'CIUDAD DE MEXICO';
          } else if (placeUpper.includes('CHINA')) {
            ubicacionNormalizada = 'CHINA';
          } else if (placeUpper.includes('USA')) {
            ubicacionNormalizada = 'USA';
          }

          return {
            token: item.token,
            ticket: item.name,
            cliente: item.cliente,
            asesor: item.asesor,
            informacion: item.category,
            estatus: item.state,
            designado: item.designado,
            responsable: item.suite, // Usar suite como responsable
            creado: item.created,
            suite: item.suite,
            ubicacion: ubicacionNormalizada,
          };
        });
        
        setTickets(ticketsTransformados);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      setTickets([]);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los tickets',
        icon: 'error',
        confirmButtonColor: '#ff6600'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = async (record: Ticket) => {
    const result = await Swal.fire({
      title: '¿Finalizar ticket?',
      text: `¿Está seguro de finalizar el ticket ${record.ticket}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#52c41a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await ticketsService.finalizarTicket(record.token);
        
        if (response.status === 'success') {
          Swal.fire({
            title: 'Finalizado',
            text: 'El ticket ha sido finalizado correctamente',
            icon: 'success',
            confirmButtonColor: '#ff6600'
          });
          loadTickets();
        } else {
          Swal.fire({
            title: 'Error',
            text: response.message || 'No se pudo finalizar el ticket',
            icon: 'error',
            confirmButtonColor: '#ff6600'
          });
        }
      } catch (error) {
        console.error('Error al finalizar ticket:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al finalizar el ticket',
          icon: 'error',
          confirmButtonColor: '#ff6600'
        });
      }
    }
  };

  const handleArchive = async (record: Ticket) => {
    const result = await Swal.fire({
      title: '¿Archivar ticket?',
      html: `¿Está seguro de archivar el ticket <b>${record.ticket}</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1890ff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, archivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await ticketsService.archiveTicket(record.token);
        if (response.status === 'success') {
          Swal.fire({ title: 'Archivado', text: 'El ticket ha sido archivado', icon: 'success', confirmButtonColor: '#ff6600' });
          // Remover el ticket de la lista actual para actualizar UI
          setTickets((prev) => prev.filter((t) => t.token !== record.token));
        } else {
          Swal.fire({ title: 'Error', text: response.message || 'No se pudo archivar el ticket', icon: 'error', confirmButtonColor: '#ff6600' });
        }
      } catch (error) {
        console.error('Error al archivar ticket:', error);
        Swal.fire({ title: 'Error', text: 'Ocurrió un error al archivar el ticket', icon: 'error', confirmButtonColor: '#ff6600' });
      }
    }
  };

  const loadTicketDetails = async (token: string) => {
    try {
      setLoadingDetalles(true);
      const response = await ticketsService.getTicketDetails(token);
      
      if (response.status === 'success' && response.data) {
        setTicketDetalles(response.data);
        setDetallesModalVisible(true);
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los detalles del ticket',
          icon: 'error',
          confirmButtonColor: '#ff6600'
        });
      }
    } catch (error) {
      console.error('Error al cargar detalles del ticket:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al cargar los detalles',
        icon: 'error',
        confirmButtonColor: '#ff6600'
      });
    } finally {
      setLoadingDetalles(false);
    }
  };

  const loadTicketEvidencias = async (token: string) => {
    try {
      setLoadingEvidencias(true);
      const response = await ticketsService.getTicketEvidences(token);
      
      if (response.status === 'success') {
        setTicketEvidencias(response.data || []);
        clearPreview();
        setEvidenciasModalVisible(true);
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar las evidencias del ticket',
          icon: 'error',
          confirmButtonColor: '#ff6600'
        });
      }
    } catch (error) {
      console.error('Error al cargar evidencias del ticket:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al cargar las evidencias',
        icon: 'error',
        confirmButtonColor: '#ff6600'
      });
    } finally {
      setLoadingEvidencias(false);
    }
  };

    const loadTicketReferences = async (token: string) => {
      try {
        setLoadingReferences(true);
        const response = await ticketsService.getTicketReferences(token);

        if (response.status === 'success') {
          setTicketReferences(response.data || []);
          setNewReference('');
          setReferencesModalVisible(true);
        } else {
          Swal.fire({ title: 'Error', text: 'No se pudieron cargar las referencias', icon: 'error', confirmButtonColor: '#ff6600' });
        }
      } catch (error) {
        console.error('Error al cargar referencias del ticket:', error);
        Swal.fire({ title: 'Error', text: 'Ocurrió un error al cargar las referencias', icon: 'error', confirmButtonColor: '#ff6600' });
      } finally {
        setLoadingReferences(false);
      }
    };

    const handleAddReference = async (tokenForAdd?: string) => {
      if (!newReference || newReference.trim() === '') {
        Swal.fire({ title: 'Escribe una referencia', icon: 'warning', confirmButtonColor: '#ff6600' });
        return;
      }

      // Como no existe endpoint público para agregar en routes (GET only), añadimos localmente a la lista.
      const nueva = {
        id: String(Date.now()),
        token: tokenForAdd || '',
        name: newReference.trim(),
        resp: null,
        state: '1',
        created: new Date().toISOString(),
      };

      setTicketReferences((prev) => [nueva, ...prev]);
      setNewReference('');
      Swal.fire({ title: 'Referencia anexada', icon: 'success', confirmButtonColor: '#ff6600' });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      // Clear previous preview URL if any
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      if (file.type.startsWith('image/')) {
        setPreviewType('image');
      } else if (file.type === 'application/pdf') {
        setPreviewType('pdf');
      } else {
        setPreviewType(null);
      }
    };

    const clearPreview = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setPreviewType(null);
    };

    const handleAddEvidence = async () => {
      if (!selectedFile) {
        Swal.fire({ title: 'Seleccione un archivo', icon: 'warning', confirmButtonColor: '#ff6600' });
        return;
      }

      // Placeholder: si existe endpoint para subir evidencias, aquí se implementaría el POST.
      // Por ahora solo mostramos confirmación y limpiamos la previsualización.
      Swal.fire({ title: 'Evidencia añadida', text: selectedFile.name, icon: 'success', confirmButtonColor: '#ff6600' });
      clearPreview();
    };

  // Filtrar datos según el término de búsqueda
  const datosFiltrados = tickets.filter((ticket) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      ticket.ticket?.toLowerCase().includes(searchLower) ||
      ticket.cliente?.toLowerCase().includes(searchLower) ||
      ticket.asesor?.toLowerCase().includes(searchLower) ||
      ticket.informacion?.toLowerCase().includes(searchLower) ||
      ticket.estatus?.toLowerCase().includes(searchLower) ||
      ticket.designado?.toLowerCase().includes(searchLower) ||
      ticket.suite?.toLowerCase().includes(searchLower) ||
      ticket.creado?.toLowerCase().includes(searchLower) ||
      ticket.ubicacion?.toLowerCase().includes(searchLower)
    );
  });

  const columnas: ColumnsType<Ticket> = [
    {
      title: 'TICKET',
      dataIndex: 'ticket',
      key: 'ticket',
      width: 200,
      align: 'center',
      render: (value, record) => {
        const esPoliticaCompensacion = record.informacion?.toLowerCase().includes('compensaci');
        const colorTicket = esPoliticaCompensacion ? '#ff0000' : '#000';
        
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 500, marginBottom: '4px', color: colorTicket }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.informacion}</div>
          </div>
        );
      },
    },
    {
      title: 'CLIENTE',
      dataIndex: 'cliente',
      key: 'cliente',
      width: 250,
      align: 'center',
      render: (value, record) => (
        <div style={{ textAlign: 'center' }}>
          <div>({record.suite})</div>
          <div>{value}</div>
        </div>
      ),
    },
    {
      title: 'ASESOR',
      dataIndex: 'asesor',
      key: 'asesor',
      width: 180,
      align: 'center',
    },
    {
      title: 'INFORMACIÓN',
      key: 'informacion_btns',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            size="small"
            onClick={() => loadTicketDetails(record.token)}
            style={{ 
              background: '#ff8c42', 
              borderColor: '#ff8c42',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(255, 140, 66, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 140, 66, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 140, 66, 0.4)';
            }}
          />
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            size="small"
            onClick={() => { setTicketSeleccionado(record); loadTicketReferences(record.token); }}
            style={{ 
              background: '#d98dce', 
              borderColor: '#d98dce',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(217, 141, 206, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(217, 141, 206, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(217, 141, 206, 0.4)';
            }}
          />
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            size="small"
            onClick={() => loadTicketEvidencias(record.token)}
            style={{ 
              background: '#4169e1', 
              borderColor: '#4169e1',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(65, 105, 225, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(65, 105, 225, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(65, 105, 225, 0.4)';
            }}
          />
        </div>
      ),
    },
    {
      title: 'ESTATUS',
      dataIndex: 'estatus',
      key: 'estatus',
      width: 180,
      align: 'center',
      render: (value, record) => {
        let color = 'blue';
        if (value === 'Pendiente') color = 'orange';
        if (value === 'En proceso') color = 'blue';
        if (value === 'Finalizado') color = 'green';
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Tag color={color}>{value}</Tag>
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button
                icon={<ClockCircleOutlined />}
                size="small"
                onClick={() => {
                  setTicketSeleccionado(record);
                  setTimelineModalVisible(true);
                }}
                title="Ver timeline"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.4)';
                }}
              />
              <Button
                icon={<UnorderedListOutlined />}
                size="small"
                onClick={() => {
                  setTicketSeleccionado(record);
                  setSubestadosModalVisible(true);
                }}
                title="Ver subestados"
                style={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(240, 147, 251, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(240, 147, 251, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(240, 147, 251, 0.4)';
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: 'DESIGNADO',
      dataIndex: 'designado',
      key: 'designado',
      width: 180,
      align: 'center',
    },
    {
      title: 'FINALIZAR',
      key: 'finalizar',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleFinalizar(record)}
            size="small"
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            title="Finalizar ticket"
          />
          <Button
            type="default"
            icon={<InboxOutlined />}
            onClick={() => handleArchive(record)}
            size="small"
            style={{ background: '#f0ad4e', borderColor: '#f0ad4e', color: '#fff' }}
            title="Archivar ticket"
          />
        </div>
      ),
    },
    {
      title: 'CREADO',
      dataIndex: 'creado',
      key: 'creado',
      width: 200,
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        
        const fecha = new Date(value);
        const opciones: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        };
        
        return fecha.toLocaleDateString('es-ES', opciones);
      },
    },
  ];

  return (
    <div className="tickets-container">
      <Card 
        title={<h2 style={{ margin: 0 }}>LISTA DE TICKETS</h2>}
        className="tickets-card"
      >
        {/* Glosario de colores */}
        <div className="glosario-colores">
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            marginBottom: '16px',
            color: '#333'
          }}>
            GLOSARIO DE COLORES
          </h3>
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Monterrey</span>
              <Badge color={ubicacionColors.MONTERREY} style={{ transform: 'scale(1.5)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Guadalajara</span>
              <Badge color={ubicacionColors.GUADALAJARA} style={{ transform: 'scale(1.5)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Ciudad de México</span>
              <Badge color={ubicacionColors['CIUDAD DE MEXICO']} style={{ transform: 'scale(1.5)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>China</span>
              <Badge color={ubicacionColors.CHINA} style={{ transform: 'scale(1.5)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>USA</span>
              <Badge color={ubicacionColors.USA} style={{ transform: 'scale(1.5)' }} />
            </div>
          </div>
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: '2px solid #f0f0f0' 
          }} />
        </div>

        {/* Buscador */}
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar por Ticket, Cliente, Asesor, Estatus, Designado, Fecha o Ubicación"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
            style={{ width: '100%' }}
          />
        </div>

        <Table
          columns={columnas}
          dataSource={datosFiltrados}
          loading={loading}
          rowKey={(record) => record.token}
          onRow={(record) => ({
            style: {
              backgroundColor: ubicacionColors[record.ubicacion] + '20', // 20 = 12.5% opacity
            },
          })}
          pagination={{
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total) => `Total: ${total} tickets`,
            onShowSizeChange: (_, size) => setPageSize(size),
          }}
          scroll={{ x: 1550 }}
          className="tabla-tickets"
        />
      </Card>

      {/* Modal Timeline */}
      <Modal
        title={`Timeline - Ticket ${ticketSeleccionado?.ticket || ''}`}
        open={timelineModalVisible}
        onCancel={() => setTimelineModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTimelineModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={600}
      >
        <Timeline
          mode="left"
          items={[
            {
              color: 'green',
              children: (
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Ticket creado</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{ticketSeleccionado?.creado}</p>
                </div>
              ),
            },
            {
              color: 'blue',
              children: (
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>En proceso</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Asignado a {ticketSeleccionado?.designado}</p>
                </div>
              ),
            },
            {
              color: 'gray',
              children: (
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Estado actual</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{ticketSeleccionado?.estatus}</p>
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* Modal Subestados */}
      <Modal
        title={`Subestados - Ticket ${ticketSeleccionado?.ticket || ''}`}
        open={subestadosModalVisible}
        onCancel={() => setSubestadosModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSubestadosModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={500}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>Estatus actual</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1890ff' }}>{ticketSeleccionado?.estatus}</p>
          </div>
          <div style={{ marginBottom: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>Categoría</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{ticketSeleccionado?.informacion}</p>
          </div>
          <div style={{ marginBottom: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>Designado</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{ticketSeleccionado?.designado}</p>
          </div>
          <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>Ubicación</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{ticketSeleccionado?.ubicacion}</p>
          </div>
        </div>
      </Modal>

      {/* Modal Detalles del Ticket */}
      <Modal
        title="Detalles del Ticket"
        open={detallesModalVisible}
        onCancel={() => {
          setDetallesModalVisible(false);
          setTicketDetalles(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetallesModalVisible(false);
            setTicketDetalles(null);
          }}>
            Cerrar
          </Button>,
        ]}
        width={700}
      >
        {loadingDetalles ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>Cargando detalles...</p>
          </div>
        ) : ticketDetalles ? (
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>Descripción</p>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                color: '#333'
              }}>
                {ticketDetalles.description}
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#666', marginBottom: '8px' }}>Categoría</p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: '#1890ff' }}>
                  {ticketDetalles.category}
                </p>
              </div>
              
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#666', marginBottom: '8px' }}>Ubicación</p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>
                  {ticketDetalles.place}
                </p>
              </div>
            </div>

            {ticketDetalles.subcategory && (
              <div style={{ marginTop: '12px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#666', marginBottom: '8px' }}>Subcategoría</p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>
                  {ticketDetalles.subcategory}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <p>No hay detalles disponibles</p>
          </div>
        )}
      </Modal>

        {/* Modal Referencias del Ticket */}
        <Modal
          title="Referencias del ticket"
          open={referencesModalVisible}
          onCancel={() => {
            setReferencesModalVisible(false);
            setTicketReferences([]);
            setNewReference('');
          }}
          footer={[
            <Button key="close" onClick={() => {
              setReferencesModalVisible(false);
              setTicketReferences([]);
              setNewReference('');
            }}>
              Cerrar
            </Button>
          ]}
          width={700}
        >
          {loadingReferences ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p>Cargando referencias...</p>
            </div>
          ) : (
            <div style={{ padding: '16px 0' }}>
              {ticketReferences.length === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ marginTop: 0 }}>¡Lo sentimos mucho!</h2>
                  <p style={{ color: '#666', maxWidth: 600, margin: '8px auto 16px' }}>
                    Desafortunadamente, este ticket no cuenta con referencias, pero no te preocupes, puedes anexarlas ahora mismo. ¿Te gustaría hacerlo?
                  </p>
                  <Input
                    placeholder="Escribe la nueva referencia a anexar (Oprime Alt + A)"
                    value={newReference}
                    onChange={(e) => setNewReference(e.target.value)}
                    onKeyDown={(e) => { if (e.altKey && e.key.toLowerCase() === 'a') { handleAddReference(ticketSeleccionado?.token || ''); } }}
                    style={{ marginBottom: 12, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}
                  />
                  <div style={{ maxWidth: 600, margin: '12px auto' }}>
                    <Button type="primary" style={{ background: '#ff6600', borderColor: '#ff6600', width: '100%' }} onClick={() => handleAddReference(ticketSeleccionado?.token || '')}>
                      Anexar referencia
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Table
                    columns={[
                      { title: 'ID', dataIndex: 'id', key: 'id', width: 100, align: 'center' },
                      { title: 'Referencia', dataIndex: 'name', key: 'name' },
                      { title: 'Responsable', dataIndex: 'resp', key: 'resp', width: 120, align: 'center' },
                      { title: 'Estado', dataIndex: 'state', key: 'state', width: 120, align: 'center' },
                      { title: 'Creado', dataIndex: 'created', key: 'created', width: 200, align: 'center', render: (val) => val ? new Date(val).toLocaleString('es-ES') : '-' },
                    ]}
                    dataSource={ticketReferences}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    style={{ marginBottom: 16 }}
                  />

                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                    <Input
                      placeholder="Escribe la nueva referencia a anexar (Oprime Alt + A)"
                      value={newReference}
                      onChange={(e) => setNewReference(e.target.value)}
                      onKeyDown={(e) => { if (e.altKey && e.key.toLowerCase() === 'a') { handleAddReference(ticketSeleccionado?.token || ''); } }}
                      style={{ marginBottom: 12 }}
                    />
                    <Button type="primary" style={{ background: '#ff6600', borderColor: '#ff6600' }} onClick={() => handleAddReference(ticketSeleccionado?.token || '')}>
                      Anexar referencia
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

      {/* Modal Evidencias del Ticket */}
      <Modal
        title="Evidencias del ticket"
        open={evidenciasModalVisible}
        onCancel={() => {
          setEvidenciasModalVisible(false);
          setTicketEvidencias([]);
          clearPreview();
        }}
        footer={[
          <Button key="close" onClick={() => {
            setEvidenciasModalVisible(false);
            setTicketEvidencias([]);
            clearPreview();
          }}>
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        {loadingEvidencias ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>Cargando evidencias...</p>
          </div>
        ) : (
          <div style={{ padding: '16px 0' }}>
            <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
              A continuación se muestran las evidencias anexadas al ticket. Puede descargar cada evidencia haciendo clic en su nombre.
            </p>
            
            <Table
              columns={[
                {
                  title: 'Número evidencia',
                  dataIndex: 'id',
                  key: 'id',
                  width: 150,
                  align: 'center',
                },
                {
                  title: 'Evidencia anexada',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record: any) => (
                    <a 
                      href={`https://www.sistemaentregax.com/tickets/inic/${record.token}.${record.ext}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#1890ff', textDecoration: 'underline' }}
                    >
                      {text}
                    </a>
                  ),
                },
                {
                  title: 'Extensión evidencia',
                  dataIndex: 'ext',
                  key: 'ext',
                  width: 150,
                  align: 'center',
                  render: (text) => (
                    <Tag color="blue">{text?.toUpperCase()}</Tag>
                  ),
                },
              ]}
              dataSource={ticketEvidencias}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: 'No hay evidencias registradas para este ticket'
              }}
              style={{ marginBottom: '20px' }}
            />

            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              background: '#f5f5f5', 
              borderRadius: '8px',
              border: '1px dashed #d9d9d9'
            }}>
              <p style={{ marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>Añadir nueva evidencia</p>

              {previewUrl && (
                <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                  {previewType === 'image' && (
                    <img src={previewUrl} alt="Previsualización" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid #e8e8e8' }} />
                  )}

                  {previewType === 'pdf' && (
                    <iframe title="Previsualización PDF" src={previewUrl} style={{ width: '100%', height: '400px', border: '1px solid #e8e8e8', borderRadius: 8 }} />
                  )}

                  {previewType === null && (
                    <p style={{ color: '#999' }}>Previsualización no disponible para este tipo de archivo</p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={{ 
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    background: 'white'
                  }}
                />
                <Button 
                  type="primary" 
                  onClick={handleAddEvidence}
                  style={{ 
                    background: '#ff6600', 
                    borderColor: '#ff6600',
                    fontWeight: 600
                  }}
                >
                  Añadir evidencia
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TicketsActivos;
