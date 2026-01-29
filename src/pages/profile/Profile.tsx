import { useEffect, useState, useRef } from 'react';
import { Card, Descriptions, Avatar, Button, Form, Input, Upload, Modal, Row, Col, Spin } from 'antd';
import { UserOutlined, MailOutlined, KeyOutlined, EditOutlined, CameraOutlined, LockOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import Croppie from 'croppie';
import 'croppie/croppie.css';
import './Profile.css';
import { useSnackbar } from 'notistack';

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [cropModal, setCropModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [croppieInstance, setCroppieInstance] = useState<Croppie | null>(null);
  const croppieRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    document.title = 'Sistema Entregax | Mi Perfil';
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const profileData = await authService.getProfile(user.id);
      
      if (profileData.status === 'success' && profileData.data) {
        // Actualizar el store con todos los datos del perfil
        setUser({
          ...user,
          ...profileData.data
        } as any);
      }
    } catch (error: any) {
      console.error('Error al cargar el perfil:', error);
      enqueueSnackbar('Error al cargar la información del perfil', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: (user as any).phone,
        birthdate: (user as any).birthdate || (user as any).fechanacimiento,
        shirt_size: (user as any).shirt_size || (user as any).tallacamisa,
        lemausuario: (user as any).lemausuario,
      });
      contactForm.setFieldsValue({
        whatsapp: (user as any).whatsapp,
        wechat: (user as any).wechat,
        instagram: (user as any).instagram,
        facebook: (user as any).facebook,
        twitter: (user as any).twitter,
      });
    }
  }, [user, form, contactForm]);

  const handleUpdateProfile = async (values: any) => {
    try {
      // Aquí iría la llamada a la API para actualizar el perfil
      enqueueSnackbar('Perfil actualizado correctamente', { variant: 'success' });
      
      // Actualizar el store con los nuevos datos
      if (user) {
        setUser({
          ...user,
          name: values.name,
          email: values.email,
          phone: values.phone,
          birthdate: values.birthdate,
          shirt_size: values.shirt_size,
        } as any);
      }
      
      setEditMode(false);
    } catch (error) {
      enqueueSnackbar('Error al actualizar el perfil', { variant: 'error' });
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      // Aquí iría la llamada a la API para cambiar la contraseña
      enqueueSnackbar('Contraseña actualizada correctamente', { variant: 'success' });
      setChangePasswordModal(false);
      passwordForm.resetFields();
    } catch (error) {
      enqueueSnackbar('Error al cambiar la contraseña', { variant: 'error' });
    }
  };

  const handleUpdateContact = async (values: any) => {
    try {
      if (!user?.id) throw new Error('No hay usuario en sesión');
      const response = await authService.updateProfileContact(user.id, values);
      if (response.status === 'success') {
        enqueueSnackbar(response.message || 'Datos de contacto actualizados correctamente', { variant: 'success' });
        setUser({
          ...user,
          ...values
        } as any);
        setContactModal(false);
        await loadProfileData();
      } else {
        enqueueSnackbar(response.message || 'Error al actualizar los datos de contacto', { variant: 'error' });
      }
    } catch (error: any) {
      if (error?.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Error al actualizar los datos de contacto', { variant: 'error' });
      }
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Solo puedes subir archivos de imagen');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('La imagen debe ser menor a 5MB');
        return false;
      }

      // Leer archivo y abrir modal de recorte
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropModal(true);
        setTimeout(() => {
          if (croppieRef.current && e.target?.result) {
            const instance = new Croppie(croppieRef.current, {
              viewport: { width: 300, height: 300, type: 'circle' },
              boundary: { width: 400, height: 400 },
              showZoomer: true,
              enableOrientation: true
            });
            instance.bind({ url: e.target.result as string });
            setCroppieInstance(instance);
          }
        }, 100);
      };
      reader.readAsDataURL(file);
      
      return false; // Prevenir upload automático
    },
  };

  const handleCropSave = async () => {
    if (!croppieInstance) return;
    try {
      const croppedImage = await croppieInstance.result({
        type: 'base64',
        size: { width: 600, height: 600 },
        format: 'jpeg',
        quality: 0.9
      });
      // Aquí iría la llamada a la API para subir la imagen recortada
      console.log('Imagen recortada:', croppedImage);
      
      // Actualizar la imagen en el store temporalmente
      if (user) {
        setUser({
          ...user,
          profile_image: croppedImage
        } as any);
      }

      enqueueSnackbar('Foto de perfil actualizada correctamente', { variant: 'success' });
      
      // Limpiar y cerrar
      croppieInstance.destroy();
      setCroppieInstance(null);
      setCropModal(false);
    } catch (error) {
      enqueueSnackbar('Error al procesar la imagen', { variant: 'error' });
    }
  };

  const handleCropCancel = () => {
    if (croppieInstance) {
      croppieInstance.destroy();
      setCroppieInstance(null);
    }
    setCropModal(false);
  };

  return (
    <div className="profile-container">
      <h1 style={{ marginBottom: '24px' }}>Mi Perfil</h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Cargando información del perfil..." />
        </div>
      ) : (
        <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Card className="profile-avatar-card">
            <div className="avatar-section">
              <Avatar
                size={150}
                icon={<UserOutlined />}
                src={(user as any)?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Usuario')}&background=f39915&color=fff&size=300`}
                style={{ cursor: 'pointer' }}
                onClick={() => setImagePreviewModal(true)}
              />
              <Upload {...uploadProps}>
                <Button 
                  icon={<CameraOutlined />} 
                  className="change-photo-btn"
                  type="primary"
                >
                  Cambiar Foto
                </Button>
              </Upload>
            </div>
            
            <div className="user-info-section">
              <h2>{user?.name || 'Usuario'}</h2>
              <p className="user-email">{user?.email || 'No disponible'}</p>
              <p className="user-type">Tipo: {user?.type || 'N/A'}</p>
            </div>

            <Button 
              icon={<LockOutlined />}
              block
              onClick={() => setChangePasswordModal(true)}
              style={{ marginTop: '16px' }}
            >
              Cambiar Contraseña
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card 
            title="Información Personal"
            extra={
              !editMode ? (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(true)}
                >
                  Editar
                </Button>
              ) : null
            }
          >
            {!editMode ? (
              <Descriptions bordered column={1}>
                                <Descriptions.Item label="Lema personal">
                                  {(user as any)?.lemausuario || 'No disponible'}
                                </Descriptions.Item>
                <Descriptions.Item label={<><UserOutlined /> Usuario en sistema</>}>
                  {user?.name || 'No disponible'}
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono personal">
                  {(user as any)?.phone || 'No disponible'}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Correo electrónico</>}>
                  {user?.email || 'No disponible'}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha de nacimiento">
                  {(user as any)?.fechanacimiento || 'No disponible'}
                </Descriptions.Item>
                <Descriptions.Item label="Talla de camisa">
                  {(user as any)?.tallacamisa || 'No disponible'}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
              >
                <Form.Item
                  label="Nombre Completo"
                  name="name"
                  rules={[
                    { required: true, message: 'Por favor ingresa tu nombre' },
                    { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nombre completo" size="large" />
                </Form.Item>

                <Form.Item
                  label="Teléfono personal"
                  name="phone"
                >
                  <Input placeholder="Teléfono" size="large" />
                </Form.Item>

                <Form.Item
                  label="Correo Electrónico"
                  name="email"
                  rules={[
                    { required: true, message: 'Por favor ingresa tu correo' },
                    { type: 'email', message: 'Ingresa un correo válido' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="correo@ejemplo.com" size="large" />
                </Form.Item>

                <Form.Item
                  label="Fecha de nacimiento"
                  name="birthdate"
                >
                  <Input type="date" size="large" />
                </Form.Item>

                <Form.Item
                  label="Talla de camisa"
                  name="shirt_size"
                >
                  <Input placeholder="Ej: M, L, XL" size="large" />
                </Form.Item>

                <Form.Item
                  label="Lema personal"
                  name="lemausuario"
                >
                  <Input placeholder="Tu lema personal" size="large" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large">
                    Guardar Cambios
                  </Button>
                  <Button 
                    style={{ marginLeft: '8px' }} 
                    onClick={() => {
                      setEditMode(false);
                      form.resetFields();
                    }}
                    size="large"
                  >
                    Cancelar
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Card>

          <Card 
            title="Datos de Contacto"
            style={{ marginTop: '24px' }}
            extra={
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => setContactModal(true)}
              >
                Editar
              </Button>
            }
          >
            <Descriptions bordered column={1}>
              <Descriptions.Item 
                label={
                  <span>
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                      <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </span>
                }
              >
                {(user as any)?.whatsapp || 'Sin WhatsApp agregado'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span>
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                      <path fill="#09B83E" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229 2.785 0 5.16-1.517 5.93-3.563.785-2.087.241-4.562-1.52-6.017-1.057-.873-2.431-1.39-3.934-1.655-.512-.09-.614.347-.098.43 1.246.199 2.366.662 3.169 1.339 1.406 1.187 1.89 3.078 1.263 4.776-.6 1.624-2.587 2.947-5.054 2.947-2.595 0-4.737-1.461-5.4-3.433-.736-2.018.114-3.982 1.62-5.17 1.259-1.044 2.94-1.577 4.555-1.458.513.038.61-.387.098-.474a6.918 6.918 0 0 0-.553-.017z"/>
                    </svg>
                    WeChat
                  </span>
                }
              >
                {(user as any)?.wechat || 'Sin WeChat agregado'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span>
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                      <path fill="#E4405F" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    Instagram
                  </span>
                }
              >
                {(user as any)?.instagram || 'Sin Instagram agregado'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span>
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </span>
                }
              >
                {(user as any)?.facebook || 'Sin Facebook agregado'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span>
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                      <path fill="#1DA1F2" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </span>
                }
              >
                {(user as any)?.twitter || 'Sin Twitter agregado'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      )}

      <Modal
        title="Foto de Perfil"
        open={imagePreviewModal}
        onCancel={() => setImagePreviewModal(false)}
        footer={null}
        width={600}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <img
            src={(user as any)?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Usuario')}&background=f39915&color=fff&size=512`}
            alt="Foto de perfil"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '500px',
              borderRadius: '8px',
              border: '2px solid #F46512'
            }}
          />
        </div>
      </Modal>

      <Modal
        title="Recortar Foto de Perfil"
        open={cropModal}
        onCancel={handleCropCancel}
        width={500}
        centered
        footer={[
          <Button key="cancel" onClick={handleCropCancel}>
            Cancelar
          </Button>,
          <Button key="save" type="primary" onClick={handleCropSave}>
            Guardar
          </Button>,
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <div ref={croppieRef}></div>
        </div>
      </Modal>

      <Modal
        title="Editar Datos de Contacto"
        open={contactModal}
        onCancel={() => {
          setContactModal(false);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={contactForm}
          layout="vertical"
          onFinish={handleUpdateContact}
        >
          <Form.Item
            label="WhatsApp"
            name="whatsapp"
          >
            <Input placeholder="Número de WhatsApp" size="large" />
          </Form.Item>

          <Form.Item
            label="WeChat"
            name="wechat"
          >
            <Input placeholder="Usuario de WeChat" size="large" />
          </Form.Item>

          <Form.Item
            label="Instagram"
            name="instagram"
          >
            <Input placeholder="Usuario de Instagram" size="large" />
          </Form.Item>

          <Form.Item
            label="Facebook"
            name="facebook"
          >
            <Input placeholder="Perfil de Facebook" size="large" />
          </Form.Item>

          <Form.Item
            label="Twitter"
            name="twitter"
          >
            <Input placeholder="Usuario de Twitter" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cambiar Contraseña"
        open={changePasswordModal}
        onCancel={() => {
          setChangePasswordModal(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Contraseña Actual"
            name="currentPassword"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña actual' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña actual" size="large" />
          </Form.Item>

          <Form.Item
            label="Nueva Contraseña"
            name="newPassword"
            rules={[
              { required: true, message: 'Por favor ingresa tu nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nueva contraseña" size="large" />
          </Form.Item>

          <Form.Item
            label="Confirmar Nueva Contraseña"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Por favor confirma tu nueva contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmar contraseña" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Cambiar Contraseña
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
