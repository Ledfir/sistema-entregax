import React, { useState } from 'react';
import { Card, Input, message, Button } from 'antd';
import './Recepcion.css';

const { Search } = Input;

const Recepcion: React.FC = () => {
  const [stage, setStage] = useState<'initial' | 'unique' | 'suite' | 'measure'>('initial');
  const [waybill, setWaybill] = useState('');
  const [unique, setUnique] = useState('');
  const [suite, setSuite] = useState('');
  const [peso, setPeso] = useState('');
  const [largo, setLargo] = useState('');
  const [alto, setAlto] = useState('');
  const [ancho, setAncho] = useState('');

  const handleSearch = (value: string) => {
    const val = (value || '').trim();
    if (!/^\d{10}$/.test(val)) {
      message.error('La guía debe contener exactamente 10 dígitos numéricos');
      return;
    }
    setWaybill(val);
    setStage('unique');
    message.success('Guía válida, ingresa la guía única');
  };

  const handleUnique = (value: string) => {
    const val = (value || '').trim();
    if (!/^[A-Za-z0-9]{21}$/.test(val)) {
      message.error('La guía única debe tener exactamente 21 caracteres alfanuméricos');
      return;
    }
    setUnique(val);
    setStage('suite');
    message.success('Guía única válida, ingresa el SUITE del cliente');
  };

  const handleSuite = (value: string) => {
    const raw = (value || '').trim();
    const val = raw.toUpperCase();
    if (!/^[SR]\d+$/.test(val)) {
      message.error('El SUITE debe iniciar con S o R seguido únicamente de números');
      return;
    }
    setSuite(val);
    setStage('measure');
    message.success('SUITE válido, captura las medidas');
  };

  const handleMeasurementsSubmit = () => {
    const numRe = /^\d+(?:\.\d+)?$/;
    if (!numRe.test(peso) || !numRe.test(largo) || !numRe.test(alto) || !numRe.test(ancho)) {
      message.error('Todos los valores de medida deben ser numéricos');
      return;
    }
    console.log('Medidas capturadas:', { waybill, unique, suite, peso, largo, alto, ancho });
    message.success('Medidas guardadas');
    // Aquí se puede realizar la petición al backend para guardar todo
    setStage('initial');
    setWaybill('');
    setUnique('');
    setSuite('');
    setPeso('');
    setLargo('');
    setAlto('');
    setAncho('');
  };

  return (
    <div className="dhl-recepcion-wrapper">
      <Card className="dhl-recepcion-card" title="DHL - Recibir Guias" bordered>
        <div className="dhl-recepcion-body">
          {stage === 'initial' ? (
            <>
              <label className="dhl-recepcion-label">Ingresa Guia DHL (10 Digitos)</label>
              <Search
                className="dhl-recepcion-input"
                placeholder="0000000000"
                enterButton={false}
                maxLength={10}
                inputMode="numeric"
                aria-label="Ingresa Guia DHL (10 Digitos)"
                allowClear
                onSearch={handleSearch}
              />
            </>
          ) : stage === 'unique' ? (
            <>
              <label className="dhl-recepcion-label">Ingresar Guia Unica (21 digitos)</label>
              <Search
                className="dhl-recepcion-input"
                placeholder="ABCDEFGHIJK1234567890"
                enterButton={false}
                maxLength={21}
                value={unique}
                onChange={(e) => setUnique(e.target.value)}
                aria-label="Ingresar Guia Unica (21 digitos)"
                allowClear
                onSearch={handleUnique}
              />
            </>
          ) : stage === 'suite' ? (
            <>
              <label className="dhl-recepcion-label">Capturar SUITE Cliente</label>
              <Search
                className="dhl-recepcion-input"
                placeholder="S12345 o R67890"
                enterButton={false}
                value={suite}
                onChange={(e) => setSuite(e.target.value)}
                aria-label="Capturar SUITE Cliente"
                allowClear
                onSearch={handleSuite}
              />
            </>
          ) : (
            <>
              <div className="capture-header">
                <div className="capture-icon">📋</div>
                <h3 className="capture-title">CAPTURAR MEDIDAS</h3>
              </div>
              <div className="measure-grid">
                <div>
                  <label className="measure-label">Peso</label>
                  <Input value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Peso" />
                </div>
                <div>
                  <label className="measure-label">Largo</label>
                  <Input value={largo} onChange={(e) => setLargo(e.target.value)} placeholder="Largo" />
                </div>
                <div>
                  <label className="measure-label">Alto</label>
                  <Input value={alto} onChange={(e) => setAlto(e.target.value)} placeholder="Alto" />
                </div>
                <div>
                  <label className="measure-label">Ancho</label>
                  <Input value={ancho} onChange={(e) => setAncho(e.target.value)} placeholder="Ancho" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <Button type="primary" onClick={handleMeasurementsSubmit}>Ingresar Guia</Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Recepcion;
