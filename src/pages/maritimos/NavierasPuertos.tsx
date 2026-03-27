import { useState } from 'react';
import { Card, Carousel, Button, Modal, Form, Input, Dropdown, message } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import './NavierasPuertos.css';

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

  // Mock data para navieras
  const [navieras, setNavieras] = useState<Naviera[]>([
    { key: '1', nombre: 'Maersk Line' },
    { key: '2', nombre: 'MSC Mediterranean Shipping Company' },
    { key: '3', nombre: 'CMA CGM Group' },
    { key: '4', nombre: 'COSCO Shipping Lines' },
    { key: '5', nombre: 'Hapag-Lloyd' },
  ]);

  // Mock data para puertos
  const [puertos, setPuertos] = useState<Puerto[]>([
    { key: '1', nombre: 'Puerto de Miami' },
    { key: '2', nombre: 'Puerto de Los Ángeles' },
    { key: '3', nombre: 'Puerto de Houston' },
    { key: '4', nombre: 'Puerto de Newark' },
    { key: '5', nombre: 'Puerto de Long Beach' },
  ]);

  const handleAgregarNaviera = () => {
    setModalType('naviera');
    setIsModalVisible(true);
  };

  const handleAgregarPuerto = () => {
    setModalType('puerto');
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalType === 'naviera') {
        const newNaviera: Naviera = {
          key: String(navieras.length + 1),
          nombre: values.nombre,
        };
        setNavieras([...navieras, newNaviera]);
        message.success('Naviera agregada exitosamente');
      } else {
        const newPuerto: Puerto = {
          key: String(puertos.length + 1),
          nombre: values.nombre,
        };
        setPuertos([...puertos, newPuerto]);
        message.success('Puerto agregado exitosamente');
      }
      
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error al validar:', error);
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleEliminarNaviera = (key: string) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta naviera?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        setNavieras(navieras.filter(n => n.key !== key));
        message.success('Naviera eliminada exitosamente');
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

  const renderNavieraCard = (naviera: Naviera) => (
    <div className="carousel-card-wrapper" key={naviera.key}>
      <Card className="carousel-item-card">
        <Dropdown
          menu={{
            items: [
              {
                key: 'editar',
                label: 'Editar',
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
              {navieras.map((naviera) => renderNavieraCard(naviera))}
            </Carousel>
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
              {puertos.map((puerto) => renderPuertoCard(puerto))}
            </Carousel>
          </div>
        </div>
      </Card>

      <Modal
        title={modalType === 'naviera' ? 'Agregar Nueva Naviera' : 'Agregar Nuevo Puerto'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Agregar"
        cancelText="Cancelar"
        width={500}
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
