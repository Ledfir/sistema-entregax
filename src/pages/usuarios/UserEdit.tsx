import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Spin } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import userService from '../../services/userService';
import Swal from 'sweetalert2';
import './UserCreate.css';

export const UserEdit = () => {
  const { token } = useParams<{ token: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tiposUsuario, setTiposUsuario] = useState<any[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<any[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const [loadingTeamLeaders, setLoadingTeamLeaders] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTiposUsuario();
    loadUbicaciones();
    if (token) {
      loadUserData();
    }
  }, [token]);

  const loadUserData = async () => {
    try {
      setLoadingUser(true);
      console.log('Cargando usuario con token:', token);
      const data = await userService.get(token!);
      console.log('Datos del usuario recibidos:', data);
      
      // Pre-rellenar el formulario
      form.setFieldsValue({
        name: data.name,
        phone: data.phone,
        mail: data.mail,
        tipo_usuario: data.tipo_usuario_token || data.type,
        asesor: data.asesor_token || (data.micapitan && data.micapitan !== '0' ? data.micapitan : undefined),
        ubicacion: data.ubicacion_token || data.ubic,
      });

      // Si tiene asesor, cargar team leaders
      if (data.asesor_token || (data.micapitan && data.micapitan !== '0')) {
        await loadTeamLeaders();
      }
    } catch (error: any) {
      console.error('Error completo al cargar usuario:', error);
      console.error('Response:', error?.response?.data);
      const errorMsg = error?.response?.data?.message || 
                       error?.response?.data?.error || 
                       error?.message || 
                       'No se pudieron cargar los datos del usuario';
      message.error(errorMsg);
      navigate('/usuarios/lista');
    } finally {
      setLoadingUser(false);
    }
  };

  const loadTiposUsuario = async () => {
    try {
      setLoadingTipos(true);
      const data = await userService.listTypes();
      setTiposUsuario(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar tipos de usuario:', error);
      message.error('No se pudieron cargar los tipos de usuario');
    } finally {
      setLoadingTipos(false);
    }
  };

  const loadUbicaciones = async () => {
    try {
      setLoadingUbicaciones(true);
      const data = await userService.listUbications();
      setUbicaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
      message.error('No se pudieron cargar las ubicaciones');
    } finally {
      setLoadingUbicaciones(false);
    }
  };

  const loadTeamLeaders = async () => {
    try {
      setLoadingTeamLeaders(true);
      const data = await userService.listTeamLeaders();
      setTeamLeaders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar team leaders:', error);
      message.error('No se pudieron cargar los team leaders');
    } finally {
      setLoadingTeamLeaders(false);
    }
  };

  const handleTipoUsuarioChange = (value: string) => {
    // Limpiar el campo asesor
    form.setFieldsValue({ asesor: undefined });
    
    // Buscar el tipo de usuario por token para obtener su nombre
    const tipoSeleccionado = tiposUsuario.find((tipo: any) => tipo.token === value);
    const nombreTipo = tipoSeleccionado?.nombre || tipoSeleccionado?.name;
    
    // Si selecciona ASESOR, cargar team leaders
    if (nombreTipo === 'ASESOR') {
      loadTeamLeaders();
    } else {
      setTeamLeaders([]);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Crear objeto JSON con los datos del usuario
      const payload: any = {
        token: token!,
        name: values.name,
        phone: values.phone,
        mail: values.mail,
        tipo_usuario: values.tipo_usuario,
        asesor: values.asesor || '',
        ubicacion: values.ubicacion || '',
      };
      
      // Solo enviar contraseña si se ingresó una nueva
      if (values.password) {
        payload.password = values.password;
      }

      await userService.update(payload);

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El usuario ha sido actualizado correctamente',
        showConfirmButton: false,
        timer: 2000,
      });

      // Redirigir a la lista de usuarios
      setTimeout(() => {
        navigate('/usuarios/lista');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.message || 
                           'No se pudo actualizar el usuario';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/usuarios/lista');
  };

  if (loadingUser) {
    return (
      <div className="user-create-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="user-create-container">
      <div className="user-create-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/usuarios/lista')}
          style={{ marginRight: 16 }}
        >
          Volver
        </Button>
        <h1>Editar usuario</h1>
      </div>

      <div className="user-create-form-wrapper">
        <div className="form-required-message">
          Los campos marcados con <span className="required-asterisk">*</span> son obligatorios
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="user-create-form"
          autoComplete="off"
        >
          {/* Nombre */}
          <Form.Item
            name="name"
            label={
              <span className="form-label">
                <UserOutlined className="form-icon green-icon" /> Nombre:
              </span>
            }
            rules={[{ required: true, message: 'Por favor ingrese el nombre del usuario' }]}
          >
            <Input placeholder="Ingrese el nombre del usuario" />
          </Form.Item>

          {/* Teléfono y Correo */}
          <div className="form-row">
            <Form.Item
              name="phone"
              label={
                <span className="form-label">
                  <PhoneOutlined className="form-icon red-icon" /> Teléfono:
                </span>
              }
              rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}
              className="form-item-half"
            >
              <Input placeholder="Ingrese el número de contacto del usuario" />
            </Form.Item>

            <Form.Item
              name="mail"
              label={
                <span className="form-label">
                  <MailOutlined className="form-icon orange-icon" /> Correo:
                </span>
              }
              rules={[
                { required: true, message: 'Por favor ingrese el correo' },
                { type: 'email', message: 'Por favor ingrese un correo válido' }
              ]}
              className="form-item-half"
            >
              <Input placeholder="aldhairflores@entregax.com.mx" />
            </Form.Item>
          </div>

          {/* Contraseña y Confirmar contraseña */}
          <div className="form-row">
            <Form.Item
              name="password"
              label="Nueva contraseña (dejar en blanco para mantener la actual):"
              className="form-item-half password-field"
            >
              <div className="password-input-wrapper">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  onChange={() => {
                    // Revalidar el campo de confirmación cuando cambie la contraseña
                    if (form.getFieldValue('confirmPassword')) {
                      form.validateFields(['confirmPassword']);
                    }
                  }}
                />
                <span 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />} Ver contraseña
                </span>
              </div>
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirmar nueva contraseña:"
              dependencies={['password']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const password = getFieldValue('password');
                    // Si no hay contraseña, no validar confirmación
                    if (!password && !value) {
                      return Promise.resolve();
                    }
                    // Si hay contraseña, debe coincidir
                    if (!value && password) {
                      return Promise.reject(new Error('Por favor confirme la contraseña'));
                    }
                    if (password === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Las contraseñas no coinciden'));
                  },
                }),
              ]}
              className="form-item-half password-field"
            >
              <div className="password-input-wrapper">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="********"
                />
                <span 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />} Ver contraseña
                </span>
              </div>
            </Form.Item>
          </div>

          {/* Tipo de usuario y Asesor */}
          <div className="form-row">
            <Form.Item
              name="tipo_usuario"
              label="Tipo de usuario:"
              rules={[{ required: true, message: 'Por favor seleccione el tipo de usuario' }]}
              className="form-item-half"
            >
              <Select
                placeholder="Seleccione el tipo de usuario"
                loading={loadingTipos}
                showSearch
                onChange={handleTipoUsuarioChange}
                filterOption={(input, option) => {
                  const children = option?.children;
                  return String(children).toLowerCase().includes(input.toLowerCase());
                }}
              >
                {tiposUsuario.map((tipo: any) => (
                  <Select.Option key={tipo.token || tipo.id} value={tipo.token}>
                    {tipo.nombre || tipo.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="asesor"
              label="Asesor"
              className="form-item-half"
            >
              <Select 
                placeholder="Seleccione un asesor"
                loading={loadingTeamLeaders}
                showSearch
                disabled={teamLeaders.length === 0}
                filterOption={(input, option) => {
                  const children = option?.children;
                  return String(children).toLowerCase().includes(input.toLowerCase());
                }}
              >
                {teamLeaders.map((leader: any) => (
                  <Select.Option key={leader.token} value={leader.token}>
                    {leader.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Ubicación */}
          <Form.Item
            name="ubicacion"
            label={
              <span className="form-label">
                <EnvironmentOutlined className="form-icon red-icon" /> Ubicación:
              </span>
            }
          >
            <Select
              placeholder="Seleccione la ubicación"
              loading={loadingUbicaciones}
              showSearch
              filterOption={(input, option) => {
                const children = option?.children;
                return String(children).toLowerCase().includes(input.toLowerCase());
              }}
            >
              {ubicaciones.map((ubicacion: any) => (
                <Select.Option key={ubicacion.token || ubicacion.id} value={ubicacion.token}>
                  {ubicacion.nombre || ubicacion.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Botones */}
          <div className="form-actions">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="btn-submit"
              icon={<UserOutlined />}
            >
              Actualizar usuario
            </Button>
            <Button 
              onClick={handleCancel}
              className="btn-reset"
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};
