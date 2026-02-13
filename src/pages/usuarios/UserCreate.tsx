import { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Select, message } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  UploadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import Swal from 'sweetalert2';
import './UserCreate.css';

export const UserCreate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
  }, []);

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
      console.log('Team leaders recibidos:', data);
      setTeamLeaders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar team leaders:', error);
      message.error('No se pudieron cargar los team leaders');
    } finally {
      setLoadingTeamLeaders(false);
    }
  };

  const handleTipoUsuarioChange = (value: string) => {
    console.log('Tipo de usuario seleccionado (token):', value);
    // Limpiar el campo asesor
    form.setFieldsValue({ asesor: undefined });
    
    // Buscar el tipo de usuario por token para obtener su nombre
    const tipoSeleccionado = tiposUsuario.find((tipo: any) => tipo.token === value);
    const nombreTipo = tipoSeleccionado?.nombre || tipoSeleccionado?.name;
    
    console.log('Nombre del tipo:', nombreTipo);
    
    // Si selecciona ASESOR, cargar team leaders
    if (nombreTipo === 'ASESOR') {
      console.log('Cargando team leaders...');
      loadTeamLeaders();
    } else {
      console.log('No es ASESOR, limpiando team leaders');
      setTeamLeaders([]);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Validar que las contraseñas coincidan
      if (values.password !== values.confirmPassword) {
        message.error('Las contraseñas no coinciden');
        return;
      }

      setLoading(true);

      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('phone', values.phone);
      formData.append('mail', values.mail);
      formData.append('password', values.password);
      formData.append('tipo_usuario', values.tipo_usuario);
      formData.append('asesor', values.asesor || '');
      formData.append('ubicacion', values.ubicacion || '');

      // Agregar archivo si existe
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('file', fileList[0].originFileObj);
      }

      await userService.create(formData);

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El usuario ha sido creado correctamente',
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
                           'No se pudo crear el usuario';
      
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

  const handleReset = () => {
    form.resetFields();
    setFileList([]);
    setPreviewImage(null);
    setTeamLeaders([]);
    message.info('Datos borrados');
  };

  const beforeUpload = (file: any) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo puedes subir archivos de imagen (jpg, jpeg, png)');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('La imagen debe ser menor a 5MB');
      return Upload.LIST_IGNORE;
    }
    return false; // No subir automáticamente
  };

  const handleUploadChange = (info: any) => {
    setFileList(info.fileList);
    
    // Crear preview de la imagen
    if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
      const file = info.fileList[0].originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  return (
    <div className="user-create-container">
      <div className="user-create-header">
        <h1>Crear usuario</h1>
      </div>

      <div className="user-create-form-wrapper">
        <div className="form-required-message">
          Todos los campos son obligatorios <span className="required-asterisk">*</span>
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
              label="Contraseña:"
              rules={[{ required: true, message: 'Por favor ingrese la contraseña' }]}
              className="form-item-half password-field"
            >
              <div className="password-input-wrapper">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
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
              label="Confirmar contraseña:"
              rules={[{ required: true, message: 'Por favor confirme la contraseña' }]}
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

          {/* Ubicación y Subir imagen */}
          <div className="form-row">
            <Form.Item
              name="ubicacion"
              label={
                <span className="form-label">
                  <EnvironmentOutlined className="form-icon red-icon" /> Ubicación:
                </span>
              }
              className="form-item-half"
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

            <Form.Item
              name="file"
              label={
                <span className="form-label">
                  <UploadOutlined className="form-icon orange-icon" /> Subir imagen
                </span>
              }
              className="form-item-half"
            >
              <Upload
                beforeUpload={beforeUpload}
                onChange={handleUploadChange}
                fileList={fileList}
                maxCount={1}
                accept="image/jpeg,image/jpg,image/png"
              >
                <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
              </Upload>
              <div className="upload-hint">Formato permitido: jpg, jpeg, png</div>
              {previewImage && (
                <div className="image-preview-container">
                  <img src={previewImage} alt="Preview" className="image-preview" />
                </div>
              )}
            </Form.Item>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="btn-submit"
              icon={<UserOutlined />}
            >
              Crear usuario
            </Button>
            <Button 
              danger 
              onClick={handleReset}
              className="btn-reset"
            >
              Borrar datos
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};
