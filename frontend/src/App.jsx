import React, { useState, useEffect } from 'react';
import './App.css';
import { UserCircle, Power, Clock, CheckCircle, PauseCircle, Lock, Bell } from 'lucide-react';

const API_URL = `http://${window.location.hostname}:3000`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [clientOrders, setClientOrders] = useState([]);
  const [pendingRings, setPendingRings] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [newBatch, setNewBatch] = useState({ entryWeight: '', exitWeight: '', ringsCount: '' });
  const [newOrder, setNewOrder] = useState({ clientName: '', design: '', estimatedWeight: '' });
  const [despacho, setDespacho] = useState({ ringId: '', receiverId: '', executorId: '', providedPin: '', weights: { anillo: '', plastilina: '', bolsa: '' } });
  const [devolucion, setDevolucion] = useState({ orderId: '', providedPin: '', weights: { anillo: '', plastilina: '', bolsa: '' }, explanation: '' });
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ totalLoss: 0, ranking: [], incidentCount: 0, totalProduced: 0, activeWork: 0 });
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');

  // Cargar usuarios al inicio
  useEffect(() => {
    fetchUsers();
    fetchBatches();
    fetchClientOrders();
    fetchAlerts();
    fetchStats();
    fetchMachines();
    fetchPendingRings();
    fetchActiveOrders();
    const interval = setInterval(() => {
      fetchUsers();
      fetchBatches();
      fetchClientOrders();
      fetchAlerts();
      fetchStats();
      fetchMachines();
      fetchPendingRings();
      fetchActiveOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchClientOrders = async () => {
    try {
      const resp = await fetch(`${API_URL}/client-orders`);
      const data = await resp.json();
      setClientOrders(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err);
      setClientOrders([]);
    }
  };

  const fetchAlerts = async () => {
    try {
      const resp = await fetch(`${API_URL}/alerts`);
      const data = await resp.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err);
      setAlerts([]);
    }
  };

  const fetchStats = async () => {
    try {
      const resp = await fetch(`${API_URL}/stats`);
      const data = await resp.json();
      setStats(data);
    } catch (err) { console.error(err); }
  };

  const fetchMachines = async () => {
    try {
      const resp = await fetch(`${API_URL}/machines`);
      const data = await resp.json();
      setMachines(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const reportMachineIssue = async (id) => {
    const issue = prompt("Describa el fallo técnico de la máquina:");
    if (!issue) return;
    try {
      await fetch(`${API_URL}/machines/${id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue })
      });
      fetchMachines();
      fetchAlerts();
      alert("Falla técnica reportada al Vigilante Digital.");
    } catch (err) { console.error(err); }
  };

  const fixMachine = async (id) => {
    try {
      await fetch(`${API_URL}/machines/${id}/fix`, { method: 'PATCH' });
      fetchMachines();
      alert("Mantenimiento registrado. Maquinaria operativa.");
    } catch (err) { console.error(err); }
  };

  const fetchPendingRings = async () => {
    try {
      const resp = await fetch(`${API_URL}/batches/pending-rings`);
      const data = await resp.json();
      setPendingRings(data);
    } catch (err) { console.error(err); }
  };

  const fetchActiveOrders = async () => {
    try {
      const resp = await fetch(`${API_URL}/orders`);
      const data = await resp.json();
      setActiveOrders(data);
    } catch (err) { console.error(err); }
  };

  const fetchBatches = async () => {
    try {
      const resp = await fetch(`${API_URL}/batches`);
      const data = await resp.json();
      setBatches(data);
    } catch (err) {
      console.error("Error fetching batches", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const resp = await fetch(`${API_URL}/users`);
      const data = await resp.json();
      setAllUsers(data);
      // Actualizar el estado del usuario logueado si existe
      if (currentUser) {
        const updated = data.find(u => u.id === currentUser.id);
        setCurrentUser(updated);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!selectedUser || !password) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, password })
      });
      if (resp.ok) {
        const user = await resp.json();
        setCurrentUser(user);
        setSelectedUser(null);
        setPassword('');
      } else {
        alert("Contraseña incorrecta");
      }
    } catch (err) {
      alert("Error en la conexión");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/users/${currentUser.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const updatedUser = await resp.json();
      setCurrentUser(updatedUser);
      fetchUsers();
    } catch (err) {
      alert("Error al actualizar estado");
    } finally {
      setLoading(false);
    }
  };

  const executeDespacho = async (e) => {
    e.preventDefault();
    let currentDespacho = { ...despacho };
    if (currentUser.role !== 'Administrador') {
      currentDespacho.executorId = currentUser.id;
      currentDespacho.receiverId = currentUser.id;
    }

    if (!currentDespacho.ringId || !currentDespacho.executorId) return alert("Selecciona anillo y joyero");
    setLoading(true);
    
    // Convertir pesos a números antes de enviar
    const formattedDespacho = {
      ...currentDespacho,
      weights: {
        anillo: Number(currentDespacho.weights.anillo),
        plastilina: Number(currentDespacho.weights.plastilina),
        bolsa: Number(currentDespacho.weights.bolsa)
      }
    };

    try {
      const resp = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedDespacho)
      });
      if (!resp.ok) {
         const errData = await resp.json();
         throw new Error(errData.message || "Clave secreta incorrecta o error en el despacho");
      }
      await resp.json();
      setDespacho({ ringId: '', receiverId: '', executorId: '', providedPin: '', weights: { anillo: '', plastilina: '', bolsa: '' } });
      fetchUsers();
      fetchPendingRings();
      fetchActiveOrders();
      alert("Material entregado. El cronómetro ha iniciado.");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDespachoTotal = () => {
    return (parseFloat(despacho.weights.anillo) || 0) + 
           (parseFloat(despacho.weights.plastilina) || 0) + 
           (parseFloat(despacho.weights.bolsa) || 0);
  };

  const createClientOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/client-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: newOrder.clientName,
          email: newOrder.email,
          phone: newOrder.phone,
          design: newOrder.design,
          estimatedWeight: parseFloat(newOrder.estimatedWeight)
        })
      });
      await resp.json();
      setNewOrder({ clientName: '', email: '', phone: '', design: '', estimatedWeight: '' });
      fetchClientOrders();
      alert("Pedido registrado con éxito.");
    } catch (err) {
      alert("Error al registrar pedido");
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryWeight: parseFloat(newBatch.entryWeight),
          exitWeight: parseFloat(newBatch.exitWeight),
          ringsCount: parseInt(newBatch.ringsCount)
        })
      });
      await resp.json();
      setNewBatch({ entryWeight: '', exitWeight: '', ringsCount: '' });
      fetchBatches();
      alert("Lote creado y anillos generados correctamente.");
    } catch (err) {
      alert("Error al crear lote");
    } finally {
      setLoading(false);
    }
  };

  const executeDevolucion = async (e) => {
    e.preventDefault();
    if (!devolucion.orderId) return alert("Seleccione una orden");
    
    // Validar si es anomalía y requiere explicación
    const order = activeOrders.find(o => o.id === devolucion.orderId);
    const finalTotal = Number(devolucion.weights.anillo) + Number(devolucion.weights.plastilina) + Number(devolucion.weights.bolsa);
    const loss = order.totalWeight - finalTotal;
    
    if (loss > 0.05 && !devolucion.explanation) {
      return alert("Debe ingresar una explicación para la anomalía de peso detectada.");
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/orders/${devolucion.orderId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          weights: {
            anillo: Number(devolucion.weights.anillo),
            plastilina: Number(devolucion.weights.plastilina),
            bolsa: Number(devolucion.weights.bolsa)
          },
          explanation: devolucion.explanation,
          providedPin: devolucion.providedPin
        })
      });
      if (!resp.ok) {
         const errData = await resp.json();
         throw new Error(errData.message || "Error al cerrar orden o clave incorrecta");
      }
      const resultData = await resp.json();
      setDevolucion({ orderId: '', providedPin: '', weights: { anillo: '', plastilina: '', bolsa: '' }, explanation: '' });
      fetchUsers();
      fetchActiveOrders();
      fetchBatches(); // Refrescar anillos PENDING
      
      if (resultData.newGeneratedPin) {
         alert(`✅ Cierre Blindado Exitoso.\n\nLa pieza ha sido pesada y devuelta a custodia.\nEl NUEVO PIN SECRETO para el siguiente joyero (o paso) es: ${resultData.newGeneratedPin}\n\nEntrégale físicamente la pieza y dile este código para que la asuma en su mesa.`);
      } else {
         alert("✅ Cierre Blindado Exitoso.");
      }
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  if (!currentUser) {
    return (
      <div className="login-screen glass-panel animate-fade-in" style={{ maxWidth: '400px', margin: '80px auto' }}>
        <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '30px' }}>IDENTIFICACIÓN SKYNET</h2>
        
        {!selectedUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ color: '#888', textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>Seleccione su perfil de acceso</p>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '10px' }}>EQUIPO DE TALLER</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allUsers.filter(u => u.role !== 'Administrador').map(user => (
                  <button key={user.id} className="premium-btn" onClick={() => setSelectedUser(user)}>
                    <UserCircle size={18} /> {user.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '0.5px solid #333', margin: '10px 0' }}></div>
            
            <h4 style={{ color: '#666', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '10px' }}>ADMINISTRACIÓN CENTRAL</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allUsers.filter(u => u.role === 'Administrador').map(user => (
                <button 
                  key={user.id} 
                  className="premium-btn" 
                  style={{ 
                    background: user.name === 'Viralsquad' ? '#1a1a1a' : '#222', 
                    color: 'white', 
                    borderColor: user.name === 'Viralsquad' ? 'var(--gold)' : '#333' 
                  }} 
                  onClick={() => setSelectedUser(user)}
                >
                  {user.name === 'Viralsquad' ? `PANEL SUPERIOR (${user.name})` : `ADMINISTRADORA (${user.name})`}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
             <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <UserCircle size={60} className="gold-text" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ color: 'white' }}>{selectedUser.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>{selectedUser.role}</p>
             </div>
             
             <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="weight-box" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '8px', padding: '10px' }}>
                  <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoFocus
                    required
                    style={{ 
                      width: '100%', 
                      background: 'none', 
                      border: 'none', 
                      color: 'white', 
                      textAlign: 'center',
                      fontSize: '1.2rem',
                      letterSpacing: '4px'
                    }}
                  />
                </div>
                
                <button type="submit" className="action-btn-gold" disabled={loading} style={{ width: '100%', padding: '15px' }}>
                  {loading ? 'Validando...' : 'INCIAR SESIÓN'}
                </button>
                
                <button type="button" onClick={() => { setSelectedUser(null); setPassword(''); }} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', cursor: 'pointer', marginTop: '10px' }}>
                  Volver a selección de perfil
                </button>
             </form>
          </div>
        )}
      </div>
    );
  }

  const canManageBatches = currentUser.role === 'Administrador' || currentUser.role === 'Dueno';
  const canDispatch = true; // Todos pueden despachar material siguiendo tu lógica

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="premium-title">SKYNET <span className="gold-text">WORKSHOP</span></h1>
          <p style={{ color: 'var(--text-gray)' }}>Sesión: {currentUser.name} ({currentUser.role})</p>
        </div>
        <button onClick={() => setCurrentUser(null)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </header>

      <main className="main-grid">
        {/* Lado Izquierdo: Control de Servicio, Info y ALERTAS */}
        <div className="glass-panel">
          {canManageBatches && alerts.length > 0 && (
            <div className="animate-fade-in" style={{ marginBottom: '30px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <Bell size={16} /> VIGILANTE DIGITAL: ALERTAS CRÍTICAS
              </h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.map(alt => (
                  <div key={alt.id} style={{ fontSize: '0.75rem', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: alt.severity === 'CRITICAL' ? '3px solid var(--danger)' : '3px solid var(--warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <b style={{ color: alt.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)' }}>{alt.type}</b>
                      <span style={{ opacity: 0.5 }}>{new Date(alt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p>{alt.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canManageBatches ? (
            <div>
              <h3 className="gold-text">Configuración Workshop</h3>
              <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '10px', marginBottom: '30px' }}>
                Panel de control para la gestión de mermas y tiempos.
              </p>

              <div style={{ marginBottom: '40px' }}>
                <button 
                  onClick={() => window.open('/new-order', '_blank')} 
                  className="action-btn-gold" 
                  style={{ width: '100%', padding: '15px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <UserCircle size={20} /> AGREGAR PEDIDO NUEVO
                </button>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '0.7rem', color: '#444', marginBottom: '15px', letterSpacing: '1px' }}>PEDIDOS EN ESPERA</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                  {clientOrders.filter(o => o.status === 'PENDING').map(o => (
                    <div 
                       key={o.id} 
                       className="glass-panel hover-glow" 
                       onClick={() => window.open(`/track/${o.id.slice(-6)}?admin=true`, '_blank')}
                       style={{ padding: '12px', border: '1px solid rgba(212, 175, 55, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                       title="Abrir Visión de Cliente"
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--gold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {o.clientName}
                        </h5>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {o.design} <span style={{ opacity: 0.5 }}>—</span> {o.estimatedWeight}g
                        </p>
                      </div>
                      <div style={{ paddingLeft: '10px' }}>
                        <span style={{ background: 'rgba(212,175,55,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)', whiteSpace: 'nowrap' }}>
                          P-{o.id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {clientOrders.filter(o => o.status === 'PENDING').length === 0 && (
                     <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', padding: '10px' }}>No hay pedidos pendientes.</p>
                  )}
                </div>
              </div>

              {/* ADMIN CAN UPDATE CLIENT ORDERS TOO */}
              <JoyeroOrderControl clientOrders={clientOrders} fetchClientOrders={fetchClientOrders} API_URL={API_URL} loading={loading} setLoading={setLoading} />
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h3 className="gold-text">Tu Estado Actual</h3>
              <div style={{ margin: '30px 0' }}>
                <span className={`status-badge status-${currentUser.status === 'Fuera de Turno' ? 'offline' : currentUser.status === 'Disponible' ? 'available' : 'working'}`}>
                  {currentUser.status}
                </span>
              </div>
              
              {currentUser.status === 'Fuera de Turno' ? (
                <button className="premium-btn" onClick={() => updateStatus('Disponible')} disabled={loading} style={{ width: '100%' }}>
                  <Power size={20} /> ENTRAR EN SERVICIO
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button className="premium-btn" style={{ background: 'var(--danger)', color: 'white' }} onClick={() => updateStatus('Fuera de Turno')} disabled={loading}>
                     SALIR DE TURNO
                  </button>
                  <button className="premium-btn" style={{ background: 'var(--warning)', color: 'white' }} onClick={() => updateStatus('En Pausa')} disabled={loading}>
                     EN PAUSA
                  </button>
                </div>
              )}

              <JoyeroOrderControl clientOrders={clientOrders} fetchClientOrders={fetchClientOrders} API_URL={API_URL} loading={loading} setLoading={setLoading} />
            </div>
          )}
        </div>

        {/* Lado Derecho: Registro de Lotes (SOLO ADMIN) y Despacho (TODOS) */}
        <div className="glass-panel">
          {canManageBatches && (
            <>
              <div className="animate-fade-in" style={{ marginBottom: '40px' }}>
                <h2 className="gold-text" style={{ fontSize: '1rem', letterSpacing: '2px', marginBottom: '20px' }}>📊 ANALÍTICA SKYNET (Toma de Decisiones)</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
                  <div className="glass-panel" style={{ padding: '15px', textAlign: 'center', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <p style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '5px' }}>MERMA TOTAL</p>
                    <h3 className="gold-text">{stats.totalLoss}g</h3>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', textAlign: 'center', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <p style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '5px' }}>REPORTADAS</p>
                    <h3 style={{ color: stats.incidentCount > 0 ? 'var(--danger)' : 'white' }}>{stats.incidentCount}</h3>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', textAlign: 'center', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <p style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '5px' }}>TERMINADAS</p>
                    <h3>{stats.totalProduced} piezas</h3>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', textAlign: 'center', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <p style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '5px' }}>EN MESA</p>
                    <h3 style={{ color: 'var(--success)' }}>{stats.activeWork}</h3>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <h4 style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '20px' }}>TOP PRODUCTIVIDAD (Promedio min/pieza)</h4>
                    {stats.ranking?.map((entry, idx) => (
                      <div key={idx} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                          <span>{entry.name}</span>
                          <span className="gold-text">{entry.avgMinutes} min</span>
                        </div>
                        <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--gold)', width: `${Math.min(100, (300 / (entry.avgMinutes || 1)) * 10)}%` }}></div>
                        </div>
                        <p style={{ fontSize: '0.6rem', opacity: 0.4, marginTop: '3px' }}>{entry.completedCount} piezas completadas</p>
                      </div>
                    ))}
                  </div>

                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <h4 style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '20px' }}>RENTABILIDAD TRABAJO</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ padding: '10px', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.65rem', marginBottom: '5px' }}>Eficiencia Taller</p>
                        <b style={{ fontSize: '1.2rem', color: 'var(--success)' }}>98.2%</b>
                      </div>
                      <div style={{ padding: '10px', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.65rem', marginBottom: '5px' }}>Consumo de Tiempo Est.</p>
                        <b>{Math.floor(stats.totalProduced * 45)} min tot.</b>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: '0.5px solid rgba(212, 175, 55, 0.2)', margin: '40px 0' }}></div>
              </div>

              {/* 
              <div className="animate-fade-in" style={{ marginBottom: '60px' }}>
                <h2 className="gold-text" style={{ fontSize: '1rem', letterSpacing: '2px', marginBottom: '20px' }}>🏭 ESTADO DE LA PLANTA (Hardware)</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {machines.map(m => (
                    <div key={m.id} className="glass-panel" style={{ padding: '20px', border: m.status === 'DOWN' ? '1px solid var(--danger)' : '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                       <span style={{ fontWeight: 'bold' }}>{m.name}</span>
                       <span className={`status-badge status-${m.status === 'OPERATIONAL' ? 'available' : m.status === 'MAINTENANCE' ? 'paused' : 'offline'}`}>
                         {m.status}
                       </span>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '5px' }}>
                        <span>Vida Útil Lente/Filtro</span>
                        <span>{m.cycles} / {m.maintenanceThreshold} ciclos</span>
                      </div>
                      <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--gold)', width: `${(m.cycles / m.maintenanceThreshold) * 100}%` }}></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {m.status === 'OPERATIONAL' ? (
                        <button onClick={() => reportMachineIssue(m.id)} style={{ padding: '5px 10px', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '4px', cursor: 'pointer' }}>
                          REPORTAR FALLO
                        </button>
                      ) : (
                        <button onClick={() => fixMachine(m.id)} style={{ padding: '5px 10px', fontSize: '0.7rem', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: '4px', cursor: 'pointer' }}>
                          MANTENIMIENTO OK
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '0.5px solid rgba(212, 175, 55, 0.2)', margin: '40px 0' }}></div>
            </div>
            */}
            <div className="animate-fade-in" style={{ marginBottom: '60px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="gold-text" style={{ fontSize: '1rem', letterSpacing: '2px' }}>CONTROL DE FUNDICIÓN</h2>
              </div>
              
              <form onSubmit={createBatch} className="quick-batch-bar" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(120px, 1fr) 80px auto', gap: '5px' }}>
                <input 
                  type="number" step="0.01" 
                  value={newBatch.entryWeight} 
                  onChange={e => setNewBatch({...newBatch, entryWeight: e.target.value})} 
                  placeholder="ENT. CERA (g)" 
                  required 
                  style={{ 
                    background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: 'white', padding: '15px', borderRadius: '4px', textAlign: 'center' 
                  }}
                />
                <input 
                  type="number" step="0.01" 
                  value={newBatch.exitWeight} 
                  onChange={e => setNewBatch({...newBatch, exitWeight: e.target.value})} 
                  placeholder="SAL. ARBOL (g)" 
                  required 
                  style={{ 
                    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212, 175, 55, 0.5)', color: 'white', padding: '15px', borderRadius: '4px', textAlign: 'center' 
                  }}
                />
                <input 
                  type="number" 
                  value={newBatch.ringsCount} 
                  onChange={e => setNewBatch({...newBatch, ringsCount: e.target.value})} 
                  placeholder="PIEZAS" 
                  required 
                  style={{ 
                    background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: 'white', padding: '15px', borderRadius: '4px', textAlign: 'center' 
                  }}
                />
                <button type="submit" className="batch-action-btn" disabled={loading} style={{ 
                  background: 'var(--gold)', color: 'black', border: 'none', padding: '0 20px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' 
                }}>
                  + LOTE
                </button>
              </form>

              <div style={{ marginTop: '20px' }}>
                 <div className="batches-scroll">
                  {batches.map(batch => (
                    <div key={batch.id} className="batch-pill" style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                      <b>ID {batch.id.slice(-4)}</b> | Ent: <span style={{color: '#888'}}>{batch.entryWeight}g</span> | Sal: <span className="gold-text">{batch.exitWeight}g</span> | {batch.ringsCount}un
                    </div>
                  ))}
                </div>
              </div>

              </div>
            </>
          )}

          {currentUser.role.includes('Taller') && pendingRings.length > 0 && (
             <div className="animate-fade-in" style={{ marginBottom: '60px' }}>
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--gold)', background: 'linear-gradient(145deg, rgba(20,20,20,0.9), rgba(0,0,0,0.8))' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                     <Lock size={24} color="var(--gold)" />
                     <h2 className="gold-text" style={{ margin: 0 }}>BÓVEDA DE CUSTODIA (PLATINO)</h2>
                   </div>
                   <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '30px' }}>
                     Estas piezas físicas están bajo tu responsabilidad. Revela el PIN únicamente al joyero autorizado en mesa.
                   </p>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                       {pendingRings.map(r => (
                           <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center', transition: 'all 0.3s' }} className="hover-scale-subtle">
                               <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px', color: 'white' }}>{r.name}</div>
                               <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '20px' }}>Lote: {r.batchId.slice(-4)}</div>
                               <button 
                                 className="action-btn-gold" 
                                 style={{ padding: '12px', fontSize: '0.75rem', borderRadius: '6px' }}
                                 onClick={() => {
                                   alert(`==============================\nAUTORIZACIÓN DE CUSTODIA\n==============================\n\nPIEZA: ${r.name}\n\n[ PIN  SECRETO: ${r.securePin} ]\n\nEl joyero debe ingresar este código en su tableta para desbloquear el trabajo.`);
                                 }}
                               >
                                 <Lock size={14} /> REVELAR PIN DE ENTREGA
                               </button>
                           </div>
                       ))}
                   </div>
                </div>
             </div>
          )}

          {canDispatch && (
            <div className="animate-fade-in" style={{ marginBottom: '60px' }}>
              <div className="glass-panel minimalist-form">
                <header className="form-header">
                  <h2 className="gold-text">Despacho de Material</h2>
                  {pendingRings.length > 0 && (
                    <div className="total-badge">
                      <span className="label">BALANCE DE ENTREGA</span>
                      <span className="value">{calculateDespachoTotal().toFixed(2)}<small>g</small></span>
                    </div>
                  )}
                </header>

                {currentUser?.role === 'Joyero' && activeOrders.some(o => o.executorId === currentUser.id && o.status === 'OPEN') ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    <p style={{ color: 'var(--warning)', fontSize: '1.2rem', marginBottom: '10px' }}>⚠️ LÍMITE DE MESA ALCANZADO</p>
                    <p>Ya tienes una pieza física bajo tu responsabilidad. Debes retornar el material antes de poder aceptar una nueva.</p>
                  </div>
                ) : pendingRings.length > 0 ? (
                  <form onSubmit={executeDespacho}>
                    {/* Visual Grid of Batch Rings */}
                    {batches.filter(b => b.rings.some(r => r.status !== 'COMPLETED')).map(batch => (
                      <div key={batch.id} style={{ marginBottom: '25px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '3px solid var(--gold)' }}>
                        <h4 style={{ color: 'white', fontSize: '0.85rem', marginBottom: '15px', letterSpacing: '1px' }}>
                          LOTE DE FUNDICIÓN: <span className="gold-text">#{batch.id.slice(-4)}</span>
                          <span style={{ float: 'right', fontSize: '0.7rem', color: '#888', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px' }}>
                            {batch.rings.filter(r => r.status === 'PENDING').length} DISPONIBLES
                          </span>
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                           {batch.rings.filter(r => r.status !== 'COMPLETED').map(ring => {
                              let responsible = null;
                              if (ring.status === 'ASSIGNED') {
                                 const order = activeOrders.find(o => o.ringId === ring.id);
                                 if (order) {
                                    const u = allUsers.find(u => u.id === order.executorId);
                                    responsible = u ? u.name : 'En Mesa';
                                 }
                              }
                              const isSelected = despacho.ringId === ring.id;
                              
                              return (
                                 <div 
                                   key={ring.id} 
                                   onClick={() => {
                                     if (ring.status === 'PENDING') {
                                       setDespacho({...despacho, ringId: ring.id});
                                       setTimeout(() => document.getElementById('w-anillo')?.focus(), 100);
                                     }
                                   }}
                                   style={{ 
                                     background: responsible ? 'rgba(0,0,0,0.6)' : isSelected ? 'var(--gold)' : 'rgba(212, 175, 55, 0.05)',
                                     border: isSelected ? '1px solid var(--gold)' : responsible ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(212,175,55,0.3)',
                                     padding: '12px 10px',
                                     borderRadius: '6px',
                                     cursor: ring.status === 'PENDING' ? 'pointer' : 'default',
                                     textAlign: 'center',
                                     color: isSelected ? 'black' : 'white',
                                     transition: 'all 0.2s',
                                     boxShadow: isSelected ? '0 0 15px rgba(212, 175, 55, 0.3)' : 'none',
                                     opacity: responsible ? 0.5 : 1
                                   }}
                                   className={ring.status === 'PENDING' && !isSelected ? "hover-scale-subtle" : ""}
                                 >
                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '8px', color: isSelected ? 'black' : 'var(--gold)' }}>
                                      {ring.name}
                                    </div>
                                    {currentUser.role !== 'Joyero' && (
                                      <div style={{ fontSize: '0.65rem', letterSpacing: '2px', opacity: 0.8, color: isSelected ? '#a83232' : '#f39c12', marginBottom: '5px' }}>
                                        🔑 PIN: {ring.securePin}
                                      </div>
                                    )}
                                    {responsible ? (
                                      <div style={{ fontSize: '0.7rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.8 }}>
                                        <UserCircle size={12} /> {responsible}
                                      </div>
                                    ) : (
                                      <div style={{ 
                                        fontSize: '0.65rem', 
                                        fontWeight: 'bold', 
                                        background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.4)', 
                                        padding: '4px', 
                                        borderRadius: '4px' 
                                      }}>
                                        {isSelected ? '★ SELECCIONADO' : '👆 TOMAR PIEZA'}
                                      </div>
                                    )}
                                 </div>
                              )
                           })}
                        </div>
                      </div>
                    ))}

                    {/* Formulario que se despliega si se selecciona */}
                    {despacho.ringId ? (
                       <div className="animate-fade-in" style={{ marginTop: '10px' }}>
                         {/* Cabecera elegante del pesaje */}
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                           <div style={{ textAlign: 'left' }}>
                             <span style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase' }}>PESAJE INICIAL</span>
                             <h3 style={{ margin: '5px 0 0 0', color: 'white', fontSize: '1.3rem', fontWeight: 300 }}>
                               {pendingRings.find(r => r.id === despacho.ringId)?.name || 'Anillo'}
                             </h3>
                           </div>
                           
                           {(canManageBatches || currentUser.role.includes('Taller')) && (
                              <div style={{ width: '200px' }}>
                                <select 
                                  value={despacho.executorId} 
                                  onChange={e => setDespacho({...despacho, executorId: e.target.value, receiverId: currentUser.id})} 
                                  required
                                  className="minimal-select"
                                  style={{ padding: '8px', fontSize: '0.75rem' }}
                                >
                                  <option value="">ASIGNAR A...</option>
                                  {allUsers.filter(u => u.role === 'Joyero' && u.status === 'Disponible').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                              </div>
                           )}
                         </div>

                         {/* Pesos */}
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                             <div className="weight-box" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
                               <label style={{ fontSize: '0.9rem', color: 'var(--gold)', letterSpacing: '1px', flex: 1, textAlign: 'left' }}>ANILLO</label>
                               <input 
                                 type="number" step="0.01" id="w-anillo"
                                 placeholder="0.00"
                                 value={despacho.weights.anillo || ''} 
                                 onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), document.getElementById('w-plastilina').focus())}
                                 onChange={e => setDespacho({...despacho, weights: {...despacho.weights, anillo: e.target.value}})} 
                                 style={{ width: '120px', textAlign: 'right', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', fontSize: '1.5rem', padding: '5px' }}
                               />
                               <span style={{ marginLeft: '10px', color: '#666', fontSize: '1rem' }}>g</span>
                             </div>

                             <div className="weight-box" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
                               <label style={{ fontSize: '0.8rem', color: '#aaa', letterSpacing: '1px', flex: 1, textAlign: 'left' }}>PLASTILINA</label>
                               <input 
                                 type="number" step="0.01" id="w-plastilina"
                                 placeholder="0.00"
                                 value={despacho.weights.plastilina || ''} 
                                 onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), document.getElementById('w-bolsa').focus())}
                                 onChange={e => setDespacho({...despacho, weights: {...despacho.weights, plastilina: e.target.value}})} 
                                 style={{ width: '120px', textAlign: 'right', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'transparent', color: 'white', fontSize: '1.2rem', padding: '5px' }}
                               />
                               <span style={{ marginLeft: '10px', color: '#666', fontSize: '1rem' }}>g</span>
                             </div>

                             <div className="weight-box" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
                               <label style={{ fontSize: '0.8rem', color: '#aaa', letterSpacing: '1px', flex: 1, textAlign: 'left' }}>BOLSA</label>
                               <input 
                                 type="number" step="0.01" id="w-bolsa"
                                 placeholder="0.00"
                                 value={despacho.weights.bolsa || ''} 
                                 onChange={e => setDespacho({...despacho, weights: {...despacho.weights, bolsa: e.target.value}})} 
                                 style={{ width: '120px', textAlign: 'right', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'transparent', color: 'white', fontSize: '1.2rem', padding: '5px' }}
                               />
                               <span style={{ marginLeft: '10px', color: '#666', fontSize: '1rem' }}>g</span>
                             </div>
                         </div>

                         <div style={{ background: 'rgba(212,175,55,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', border: '1px solid rgba(212,175,55,0.2)' }}>
                           <label style={{ fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '1px' }}>CLAVE AUTORIZACIÓN:</label>
                           <input 
                             type="number" 
                             placeholder="****"
                             value={despacho.providedPin} 
                             onChange={e => setDespacho({...despacho, providedPin: e.target.value})}
                             style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', fontSize: '1.2rem', width: '100px', textAlign: 'center', letterSpacing: '4px', borderRadius: '4px' }}
                             required
                           />
                         </div>

                         <button type="submit" className="action-btn-gold" disabled={loading}>
                           <CheckCircle size={18} /> CONFIRMAR Y ACTIVAR CRONÓMETRO
                         </button>
                       </div>
                    ) : null}
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <p>No hay piezas de fundición disponibles para despacho.</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>Esperando a que el Administrador registre un nuevo lote...</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {canDispatch && activeOrders.length > 0 && (
            <div className="animate-fade-in" style={{ marginBottom: '60px' }}>
              <div className="glass-panel minimalist-form" style={{ 
                borderLeft: '4px solid',
                borderColor: (() => {
                  if (!devolucion.orderId) return 'var(--gold)';
                  const o = activeOrders.find(ord => ord.id === devolucion.orderId);
                  const total = Number(devolucion.weights.anillo) + Number(devolucion.weights.plastilina) + Number(devolucion.weights.bolsa);
                  return (o.totalWeight - total) > 0.05 ? 'var(--danger)' : 'var(--success)';
                })()
              }}>
                <header className="form-header">
                  <h2 className="gold-text">Cierre de Seguridad (Retorno)</h2>
                  {devolucion.orderId && (
                    <div className="total-badge">
                      <span className="label">BALANCE DE RETORNO</span>
                      <span className="value">
                        {(() => {
                          const o = activeOrders.find(ord => ord.id === devolucion.orderId);
                          const total = Number(devolucion.weights.anillo) + Number(devolucion.weights.plastilina) + Number(devolucion.weights.bolsa);
                           return (o.totalWeight - total).toFixed(3);
                        })()}<small>g</small>
                      </span>
                    </div>
                  )}
                </header>

                <form onSubmit={executeDevolucion}>
                   <div className="selection-row">
                        <select 
                          value={devolucion.orderId} 
                          onChange={e => setDevolucion({...devolucion, orderId: e.target.value})} 
                          required
                          className="minimal-select"
                        >
                          <option value="">PIEZA ACTIVA...</option>
                          {activeOrders.map(o => (
                            <option key={o.id} value={o.id}>
                              {allUsers.find(u => u.id === o.executorId)?.name} - {o.ringName}
                            </option>
                          ))}
                        </select>
                   </div>

                   <div className="weights-grid-minimal">
                      <div className="weight-box">
                        <input 
                          type="number" step="0.001" placeholder="0.000"
                          value={devolucion.weights.anillo || ''} 
                          onChange={e => setDevolucion({...devolucion, weights: {...devolucion.weights, anillo: e.target.value}})} 
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), document.getElementById('r-plastilina').focus())}
                          required
                        />
                        <label>ANILLO FINAL</label>
                      </div>
                      <div className="weight-box">
                        <input 
                          type="number" step="0.001" placeholder="0.000" id="r-plastilina"
                          value={devolucion.weights.plastilina || ''} 
                          onChange={e => setDevolucion({...devolucion, weights: {...devolucion.weights, plastilina: e.target.value}})} 
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), document.getElementById('r-bolsa').focus())}
                          required
                        />
                        <label>PLASTILINA REC.</label>
                      </div>
                      <div className="weight-box">
                        <input 
                          type="number" step="0.001" placeholder="0.000" id="r-bolsa"
                          value={devolucion.weights.bolsa || ''} 
                          onChange={e => setDevolucion({...devolucion, weights: {...devolucion.weights, bolsa: e.target.value}})} 
                          required
                        />
                        <label>BOLSA / RETAL</label>
                      </div>
                   </div>

                   {(() => {
                     if (!devolucion.orderId) return null;
                     const o = activeOrders.find(ord => ord.id === devolucion.orderId);
                     const total = Number(devolucion.weights.anillo) + Number(devolucion.weights.plastilina) + Number(devolucion.weights.bolsa);
                     if ((o.totalWeight - total) > 0.05) {
                       return (
                         <div className="animate-fade-in" style={{ marginTop: '20px' }}>
                           <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '10px' }}>
                             ⚠️ ANOMALÍA DETECTADA: La merma supera los límites técnicos. Ingrese una explicación.
                           </p>
                           <textarea 
                             className="minimal-select"
                             style={{ width: '100%', minHeight: '80px', border: '1px solid var(--danger)', padding: '10px' }}
                             placeholder="Explicación o firma del incidente..."
                             value={devolucion.explanation}
                             onChange={e => setDevolucion({...devolucion, explanation: e.target.value})}
                             required
                           />
                         </div>
                       );
                     }
                     return null;
                   })()}

                   {devolucion.orderId && (
                     <div className="animate-fade-in" style={{ background: 'rgba(212,175,55,0.05)', padding: '15px', borderRadius: '8px', marginTop: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', border: '1px solid rgba(212,175,55,0.2)' }}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '1px' }}>CLAVE DE RECIBIDO:</label>
                       <input 
                         type="number" 
                         placeholder="****"
                         value={devolucion.providedPin} 
                         onChange={e => setDevolucion({...devolucion, providedPin: e.target.value})}
                         style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', fontSize: '1.2rem', width: '100px', textAlign: 'center', letterSpacing: '4px', borderRadius: '4px' }}
                         required
                       />
                     </div>
                   )}

                   <button type="submit" className="action-btn-gold" disabled={loading || !devolucion.orderId} style={{ 
                     background: (() => {
                       if (!devolucion.orderId) return 'white';
                       const o = activeOrders.find(ord => ord.id === devolucion.orderId);
                       const total = Number(devolucion.weights.anillo) + Number(devolucion.weights.plastilina) + Number(devolucion.weights.bolsa);
                       return (o.totalWeight - total) > 0.05 ? 'var(--danger)' : 'var(--success)';
                     })(),
                     color: 'white',
                     marginTop: '20px'
                   }}>
                     <CheckCircle size={18} /> FINALIZAR ENTREGA Y DETENER TIEMPO
                   </button>
                </form>
              </div>
            </div>
          )}

          <h2 className="gold-text" style={{ marginBottom: '20px' }}>Panel de Control Taller</h2>
          <div className="joyeros-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {allUsers.filter(u => u.role === 'Joyero').map(joyero => {
              const activeOrder = activeOrders.find(o => o.executorId === joyero.id && o.status === 'OPEN');
              const status = activeOrder ? 'En Proceso' : joyero.status;
              
              return (
                <div key={joyero.id} className="glass-panel" style={{ padding: '20px', textAlign: 'center', border: status === 'Disponible' ? '1px solid var(--gold)' : status === 'En Proceso' ? '1px solid var(--warning)' : '1px solid #333' }}>
                  <UserCircle size={40} className={status === 'Disponible' || status === 'En Proceso' ? 'gold-text' : ''} style={{ marginBottom: '10px' }} />
                  <h4 style={{ marginBottom: '10px' }}>{joyero.name}</h4>
                  <span className={`status-badge status-${status === 'Fuera de Turno' ? 'offline' : status === 'Disponible' ? 'available' : status === 'En Proceso' ? 'working' : 'paused'}`}>
                    {status}
                  </span>
                  {activeOrder && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>
                        <b>{activeOrder.ringName}</b> | {(Number(activeOrder.totalWeight) || 0).toFixed(2)}g
                      </p>
                      <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem', marginTop: '5px' }}>
                         <Timer startTime={activeOrder.startTime} />
                      </div>
                    </div>
                  )}
                  {joyero.lastLogin && joyero.status !== 'Fuera de Turno' && !activeOrder && (
                    <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '10px' }}>
                      En servicio desde: {new Date(joyero.lastLogin).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {canManageBatches && (
            <div className="animate-fade-in" style={{ marginTop: '80px', borderTop: '2px solid var(--gold)', paddingTop: '40px' }}>
              <h2 className="gold-text" style={{ fontSize: '1.2rem', letterSpacing: '3px', marginBottom: '30px' }}>📋 CENTRO DE REPORTES GENERALES (SUPER ADMIN)</h2>
              
              <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', opacity: 0.7 }}>BITÁCORA INTERACTIVA DE OPERACIONES</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)' }}>
                        <th style={{ padding: '15px', textAlign: 'left' }}>ID ORDEN</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>JOYERO</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>PIEZA</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>INICIO</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>FIN / DURACIÓN</th>
                        <th style={{ padding: '15px', textAlign: 'right' }}>MERMA (g)</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrders.sort((a,b) => new Date(b.startTime) - new Date(a.startTime)).map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #222' }}>
                          <td style={{ padding: '15px', opacity: 0.5 }}>{o.id.slice(-6)}</td>
                          <td style={{ padding: '15px' }}>{allUsers.find(u => u.id === o.executorId)?.name}</td>
                          <td style={{ padding: '15px' }}>{o.ringName}</td>
                          <td style={{ padding: '15px' }}>{new Date(o.startTime).toLocaleTimeString()}</td>
                          <td style={{ padding: '15px' }}>
                            {o.endTime ? `${new Date(o.endTime).toLocaleTimeString()} (${o.durationMinutes} min)` : <span style={{ color: 'var(--warning)' }}>En proceso...</span>}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: o.loss > 0.05 ? 'var(--danger)' : 'var(--success)' }}>
                            {o.loss !== undefined ? `${o.loss}g` : '-'}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <span className={`status-badge status-${o.status === 'OPEN' ? 'working' : 'available'}`} style={{ fontSize: '0.6rem' }}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', opacity: 0.7 }}>BITÁCORA DE ASISTENCIA Y TURNOS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {allUsers.filter(u => u.role === 'Joyero').map(u => (
                    <div key={u.id} className="glass-panel" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px' }}>
                      <h4 style={{ color: 'var(--gold)', marginBottom: '10px', fontSize: '0.8rem' }}>{u.name}</h4>
                      <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {u.history?.slice().reverse().map((h, i) => (
                          <div key={i} style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                            <span>{h.status}</span>
                            <span>{new Date(h.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                        {(!u.history || u.history.length === 0) && <p style={{ fontSize: '0.7rem', opacity: 0.3 }}>Sin registros hoy</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const Timer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(startTime).getTime();
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span>{elapsed}</span>;
}

const JoyeroOrderControl = ({ clientOrders, fetchClientOrders, API_URL, loading, setLoading }) => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const steps = [
    "Diseño", "Impresión", "Casting Inicial", "Limpieza", "Pre-engaste", 
    "Vulcanizado", "Inyección", "Empalme", "Árboles", "Casting Principal", "Pulido y Acabados"
  ];
  
  const stepDescriptions = [
    "Modelar archivo 3D CAD bajo medidas y estilo especificado. Enviar render si es necesario.",
    "Imprimir pieza en máquina 3D usando resina calcinable. Asegurar soportes correctos.",
    "Someter la impresión a un primer vaciado en metal temporal para checar mermas y dimensiones.",
    "Decapado y limpieza de residuos del primer casting, detallar superficies gruesas.",
    "Ahorcado inicial y preparación de las cajas o rieles para comprobar medidas de las gemas/diamantes.",
    "Incrustar la pieza de metal en caucho, hornear y cortar quirúrgicamente el molde madre.",
    "Inyectar cera líquida dentro del molde de caucho, esperar solidificación y extraer con cuidado.",
    "Unir y soldar delicadamente las partes o secciones de cera si aplican juntas.",
    "Puntos de soldadura de cera sobre el tronco o árbol principal para el cilindro de revestimiento.",
    "Hornear cilindro y realizar el vaciado final en ORO o PLATA. Enfriamiento y desprendimiento.",
    "Uso de lijas, mantas, borlas, pasta de pulir y rouge. Limpieza ultrasónica y control de calidad final."
  ];

  const updateStep = async (orderId, stepIndex) => {
    setLoading(true);
    let status = 'IN_PRODUCTION';
    if (stepIndex === 0) status = 'PENDING';
    if (stepIndex === steps.length - 1) status = 'COMPLETED';

    try {
      await fetch(`${API_URL}/client-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, stepIndex })
      });
      fetchClientOrders();
    } catch (err) {
      alert("Error actualizando proceso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '40px', borderTop: '0.5px solid rgba(212, 175, 55, 0.2)', paddingTop: '30px', textAlign: 'left' }}>
      <h3 className="gold-text" style={{ fontSize: '1rem', letterSpacing: '1px', marginBottom: '20px', textAlign: 'center' }}>PANEL DE FABRICACIÓN</h3>
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#888', marginBottom: '25px' }}>Toca un pedido para ver la orden de trabajo y avanzar su proceso.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {clientOrders.filter(o => o.status !== 'COMPLETED').map(order => {
           const currentIndex = order.currentStepIndex || 0;
           const isExpanded = expandedOrderId === order.id;

           return (
             <div 
               key={order.id} 
               className="glass-panel animate-fade-in" 
               style={{ 
                 padding: '15px', 
                 border: isExpanded ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)', 
                 cursor: isExpanded ? 'default' : 'pointer',
                 transition: 'all 0.2s'
               }} 
               onClick={() => !isExpanded && setExpandedOrderId(order.id)}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <h4 style={{ color: isExpanded ? 'var(--gold)' : 'white', margin: '0 0 4px 0', fontSize: '0.9rem' }}>{order.clientName}</h4>
                     <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>CÓD: P-{order.id.slice(-6)} | {order.design}</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold)', padding: '4px 8px', borderRadius: '12px' }}>
                        {currentIndex + 1}. {steps[currentIndex]}
                      </span>
                   </div>
                </div>
                
                {isExpanded && (
                  <div className="animate-fade-in" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                     <div style={{ marginBottom: '15px', background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #4facfe' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', margin: '0 0 6px 0' }}>
                          <b>Instrucciones de la Pieza:</b> {order.design} — <b>Peso Estimado:</b> {order.estimatedWeight}g
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#4facfe', margin: 0, lineHeight: '1.4' }}>
                          <b>Acción Requerida para el paso actual:</b><br/>
                          {stepDescriptions[currentIndex]}
                        </p>
                     </div>

                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                       {steps.map((st, i) => {
                          const isCurrent = currentIndex === i;
                          const isPassed = currentIndex > i;
                          return (
                            <button 
                               key={i}
                               onClick={(e) => { e.stopPropagation(); updateStep(order.id, i); }}
                               disabled={loading}
                               style={{
                                 padding: '6px 10px',
                                 fontSize: '0.65rem',
                                 borderRadius: '20px',
                                 cursor: 'pointer',
                                 border: isCurrent ? '1px solid var(--gold)' : isPassed ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid #333',
                                 background: isCurrent ? 'var(--gold)' : isPassed ? 'rgba(52, 211, 153, 0.1)' : 'rgba(0,0,0,0.4)',
                                 color: isCurrent ? '#000' : isPassed ? 'var(--success)' : '#666',
                                 fontWeight: isCurrent ? 'bold' : 'normal',
                                 transition: 'all 0.2s',
                                 boxShadow: isCurrent ? '0 0 8px rgba(212, 175, 55, 0.3)' : 'none'
                               }}
                            >
                              {i+1}. {st}
                            </button>
                          )
                       })}
                     </div>
                     <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <button 
                         onClick={(e) => { e.stopPropagation(); window.open(`/track/${order.id.slice(-6)}?admin=true`, '_blank'); }}
                         style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--gold)', fontSize: '0.7rem', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px' }}
                       >
                         👁️ Ver como cliente
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setExpandedOrderId(null); }} 
                         style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.7rem', cursor: 'pointer', padding: '5px' }}
                       >
                         Cerrar Panel ▲
                       </button>
                     </div>
                  </div>
                )}
             </div>
           )
        })}
        {clientOrders.filter(o => o.status !== 'COMPLETED').length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', padding: '20px' }}>No hay pedidos activos en este momento.</p>
        )}
      </div>
    </div>
  );
};

export default App;
