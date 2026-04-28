import { useState, useEffect } from 'react';
import { Card, Carousel, Button, Modal, Form, Input, Dropdown, message } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import './NavierasPuertos.css';
import axios from '@/api/axios';

interface Naviera {
  key: string;
  nombre: string;
}

interface Puerto {
  key: string;
  nombre: string;
}

const NavierasPuertos = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'naviera' | 'puerto'>('naviera');
  const [submitting, setSubmitting] = useState(false);
  const [editingNavieraId, setEditingNavieraId] = useState<string | null>(null);
  const [editingPuertoId, setEditingPuertoId] = useState<string | null>(null);

  const [navieras, setNavieras] = useState<Naviera[]>([]);
  const [puertos, setPuertos] = useState<Puerto[]>([]);
  const [loadingNavieras, setLoadingNavieras] = useState(false);
  const [loadingPuertos, setLoadingPuertos] = useState(false);

  const handleAgregarNaviera = () => {
    setModalType('naviera');
    setIsModalVisible(true);
    setEditingNavieraId(null);
    // ensure lists are fresh
    loadNavieras();
  };

  const handleAgregarPuerto = () => {
    setModalType('puerto');
    setIsModalVisible(true);
    setEditingPuertoId(null);
    loadPuertos();
  };

  // cargar datos iniciales
  useEffect(() => {
    loadNavieras();
    loadPuertos();
  }, []);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = { name: values.nombre };
      try {
        if (modalType === 'naviera') {
          let res;
          // if editingNavieraId is set, call update endpoint
          if (editingNavieraId) {
            const updatePayload = { id: editingNavieraId, name: values.nombre };
            res = await axios.post('/operation-maritime/update-naviera', updatePayload);
          } else {
            res = await axios.post('/operation-maritime/save-naviera', { name: values.nombre });
          }
          const serverMsg = res?.data?.message;
          if (res.data?.status === 'success') {
            message.success(serverMsg || (editingNavieraId ? 'Naviera actualizada correctamente' : 'Naviera guardada correctamente'));
            setIsModalVisible(false);
            form.resetFields();
            setEditingNavieraId(null);
            await loadNavieras();
          } else {
            if (serverMsg) message.error(serverMsg);
            else message.error(editingNavieraId ? 'Error al actualizar naviera' : 'Error al guardar naviera');
          }
        } else {
          let res;
          if (editingPuertoId) {
            const updatePayload = { id: editingPuertoId, name: values.nombre };
            res = await axios.post('/operation-maritime/update-puerto', updatePayload);
          } else {
            res = await axios.post('/operation-maritime/save-puerto', payload);
          }
          const serverMsg = res?.data?.message;
          if (res.data?.status === 'success') {
            message.success(serverMsg || (editingPuertoId ? 'Puerto actualizado correctamente' : 'Puerto guardado correctamente'));
            setIsModalVisible(false);
            form.resetFields();
            setEditingPuertoId(null);
            // reload puertos so the UI updates
            await loadPuertos();
          } else {
            if (serverMsg) message.error(serverMsg);
            else message.error('Error al guardar puerto');
          }
        }
      } catch (apiErr: any) {
        console.error('API error saving item', apiErr);
        const serverMsg = apiErr?.response?.data?.message || apiErr?.response?.data?.error;
        if (serverMsg) message.error(serverMsg);
        else message.error('Error de red al guardar');
      }
    } catch (error) {
      console.error('Error al validar:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setEditingNavieraId(null);
    setEditingPuertoId(null);
  };

  const handleEditarNaviera = async (key: string) => {
    setModalType('naviera');
    setIsModalVisible(true);
    setEditingNavieraId(key);
    // fetch naviera data
    try {
      const res = await axios.get(`/operation-maritime/get-naviera/${key}`);
      if (res.data?.status === 'success' && res.data.data) {
        const data = res.data.data;
        form.setFieldsValue({ nombre: data.name || data.nombre || '' });
      } else {
        const serverMsg = res?.data?.message;
        if (serverMsg) message.error(serverMsg);
        else message.error('No se pudo cargar la naviera');
      }
    } catch (err) {
      console.error('Error cargando naviera', err);
      message.error('Error al cargar naviera');
    }
  };

  const handleEditarPuerto = async (key: string) => {
    setModalType('puerto');
    setIsModalVisible(true);
    setEditingPuertoId(key);
    try {
      const res = await axios.get(`/operation-maritime/get-puerto/${key}`);
      if (res.data?.status === 'success' && res.data.data) {
        const data = res.data.data;
        form.setFieldsValue({ nombre: data.name || data.nombre || '' });
      } else {
        const serverMsg = res?.data?.message;
        if (serverMsg) message.error(serverMsg);
        else message.error('No se pudo cargar el puerto');
      }
    } catch (err) {
      console.error('Error cargando puerto', err);
      message.error('Error al cargar puerto');
    }
  };

  const handleEliminarNaviera = (key: string) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta naviera?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const res = await axios.post('/operation-maritime/delete-naviera', { id: key });
          const serverMsg = res?.data?.message;
          if (res.data?.status === 'success') {
            message.success(serverMsg || 'Naviera eliminada correctamente');
            await loadNavieras();
          } else {
            if (serverMsg) message.error(serverMsg);
            else message.error('Error al eliminar naviera');
          }
        } catch (apiErr: any) {
          console.error('Error eliminando naviera', apiErr);
          const serverMsg = apiErr?.response?.data?.message || apiErr?.response?.data?.error;
          if (serverMsg) message.error(serverMsg);
          else message.error('Error de red al eliminar naviera');
        }
      },
    });
  };

  const handleEliminarPuerto = (key: string) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este puerto?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        setPuertos(puertos.filter(p => p.key !== key));
        message.success('Puerto eliminado exitosamente');
      },
    });
  };

  const loadNavieras = async () => {
    setLoadingNavieras(true);
    try {
      const res = await axios.get('/operation-maritime/navieras');
      if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        const mapped: Naviera[] = res.data.data.map((it: any) => ({
          key: it.token || it.id || String(Math.random()),
          nombre: it.name || it.nombre || '',
        }));
        setNavieras(mapped);
      } else {
        setNavieras([]);
        message.error('No se recibieron navieras desde el servidor');
      }
    } catch (err) {
      console.error('Error cargando navieras', err);
      message.error('Error al cargar navieras');
      setNavieras([]);
    } finally {
      setLoadingNavieras(false);
    }
  };

  const loadPuertos = async () => {
    setLoadingPuertos(true);
    try {
      const res = await axios.get('/operation-maritime/puertos');
      if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        const mapped: Puerto[] = res.data.data.map((it: any) => ({
          key: it.token || it.id || String(Math.random()),
          nombre: it.name || it.nombre || '',
        }));
        setPuertos(mapped);
      } else {
        setPuertos([]);
        message.error('No se recibieron puertos desde el servidor');
      }
    } catch (err) {
      console.error('Error cargando puertos', err);
      message.error('Error al cargar puertos');
      setPuertos([]);
    } finally {
      setLoadingPuertos(false);
    }
  };

  const renderNavieraCard = (naviera: Naviera) => (
    <div className="carousel-card-wrapper" key={naviera.key}>
      <Card className="carousel-item-card">
        <Dropdown
          menu={{
            items: [
              {
                key: 'editar',
                label: 'Editar',
                onClick: () => handleEditarNaviera(naviera.key),
              },
              {
                key: 'eliminar',
                label: 'Eliminar',
                danger: true,
                onClick: () => handleEliminarNaviera(naviera.key),
              },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />} 
            className="carousel-card-actions"
          />
        </Dropdown>
        <div className="carousel-card-content">
          <h2>{naviera.nombre}</h2>
        </div>
      </Card>
    </div>
  );

  const renderPuertoCard = (puerto: Puerto) => (
    <div className="carousel-card-wrapper" key={puerto.key}>
      <Card className="carousel-item-card">
        <Dropdown
          menu={{
            items: [
              {
                key: 'editar',
                label: 'Editar',
                onClick: () => handleEditarPuerto(puerto.key),
              },
              {
                key: 'eliminar',
                label: 'Eliminar',
                danger: true,
                onClick: () => handleEliminarPuerto(puerto.key),
              },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />} 
            className="carousel-card-actions"
          />
        </Dropdown>
        <div className="carousel-card-content">
          <h2>{puerto.nombre}</h2>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="navieras-puertos-wrapper">
      <Card 
        title="Navieras/Puertos"
        className="navieras-puertos-card"
      >
        <div className="navieras-section">
          <div className="section-header">
            <h3>Navieras</h3>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAgregarNaviera}
            >
              Agregar Naviera
            </Button>
          </div>
          <div className="carousel-container">
            <Carousel
              dots={true}
              arrows={true}
              autoplay={false}
              slidesToShow={3}
              slidesToScroll={1}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ]}
            >
              {(loadingNavieras ? [] : navieras).map((naviera) => renderNavieraCard(naviera))}
            </Carousel>
            {loadingNavieras && <div style={{ textAlign: 'center', marginTop: 12 }}>Cargando navieras...</div>}
          </div>
        </div>

        <div className="puertos-section">
          <div className="section-header">
            <h3>Puertos</h3>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAgregarPuerto}
            >
              Agregar Puerto
            </Button>
          </div>
          <div className="carousel-container">
            <Carousel
              dots={true}
              arrows={true}
              autoplay={false}
              slidesToShow={3}
              slidesToScroll={1}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ]}
            >
              {(loadingPuertos ? [] : puertos).map((puerto) => renderPuertoCard(puerto))}
            </Carousel>
            {loadingPuertos && <div style={{ textAlign: 'center', marginTop: 12 }}>Cargando puertos...</div>}
          </div>
        </div>
      </Card>

      <Modal
        title={
          modalType === 'naviera'
            ? (editingNavieraId ? 'Editar naviera' : 'Agregar Nueva Naviera')
            : (editingPuertoId ? 'Editar puerto' : 'Agregar Nuevo Puerto')
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={(editingNavieraId || editingPuertoId) ? 'Guardar' : 'Agregar'}
        cancelText="Cancelar"
        width={500}
        confirmLoading={submitting}
      >
        <Form
          form={form}
          layout="vertical"
          name={`form_${modalType}`}
        >
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[
              { required: true, message: 'Por favor ingresa el nombre' },
              { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
            ]}
          >
            <Input 
              placeholder={`Ingresa el nombre ${modalType === 'naviera' ? 'de la naviera' : 'del puerto'}`}
              maxLength={100}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NavierasPuertos;
