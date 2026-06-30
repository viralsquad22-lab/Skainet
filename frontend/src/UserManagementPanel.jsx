import React, { useState } from 'react';
import { UserCircle, Plus, Trash2, Edit3, CheckCircle, X, ShieldAlert, Lock } from 'lucide-react';

const SECURITY_QUESTIONS_POOL = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿Cuál es tu ciudad de nacimiento?",
  "¿Cuál es el nombre de tu escuela primaria?",
  "¿Cuál es tu comida favorita?",
  "¿Cuál es el nombre de tu mejor amigo de la infancia?"
];

export default function UserManagementPanel({ allUsers, fetchUsers, API_URL, token }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Joyero');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Security questions states
  const [q1, setQ1] = useState(SECURITY_QUESTIONS_POOL[0]);
  const [a1, setA1] = useState('');
  const [q2, setQ2] = useState(SECURITY_QUESTIONS_POOL[1]);
  const [a2, setA2] = useState('');
  const [q3, setQ3] = useState(SECURITY_QUESTIONS_POOL[2]);
  const [a3, setA3] = useState('');

  const openCreateForm = () => {
    setEditingUser(null);
    setUserId('');
    setName('');
    setRole('Joyero');
    setPassword('');
    setPhone('');
    setQ1(SECURITY_QUESTIONS_POOL[0]);
    setA1('');
    setQ2(SECURITY_QUESTIONS_POOL[1]);
    setA2('');
    setQ3(SECURITY_QUESTIONS_POOL[2]);
    setA3('');
    setIsFormOpen(true);
  };

  const openEditForm = async (user) => {
    setLoading(true);
    try {
      // Fetch full user details (including password and security questions)
      const resp = await fetch(`${API_URL}/users/${user.id}`);
      if (resp.ok) {
        const fullUser = await resp.json();
        setEditingUser(fullUser);
        setUserId(fullUser.id);
        setName(fullUser.name);
        setRole(fullUser.role);
        setPassword(fullUser.password || '');
        setPhone(fullUser.phone || '');

        const sq = fullUser.securityQuestions || [];
        setQ1(sq[0]?.question || SECURITY_QUESTIONS_POOL[0]);
        setA1(sq[0]?.answer || '');
        setQ2(sq[1]?.question || SECURITY_QUESTIONS_POOL[1]);
        setA2(sq[1]?.answer || '');
        setQ3(sq[2]?.question || SECURITY_QUESTIONS_POOL[2]);
        setA3(sq[2]?.answer || '');
        
        setIsFormOpen(true);
      } else {
        alert("Error al cargar los datos del usuario");
      }
    } catch (err) {
      console.error(err);
      alert("Error en la conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId || !name || !password || !a1 || !a2 || !a3) {
      alert("Todos los campos obligatorios, incluyendo las 3 preguntas de seguridad, deben ser completados.");
      return;
    }

    const payload = {
      id: userId,
      name,
      role,
      password,
      phone,
      securityQuestions: [
        { question: q1, answer: a1 },
        { question: q2, answer: a2 },
        { question: q3, answer: a3 }
      ]
    };

    setLoading(true);
    try {
      const url = editingUser ? `${API_URL}/users/${editingUser.id}` : `${API_URL}/users`;
      const method = editingUser ? 'PATCH' : 'POST';

      const resp = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        alert(editingUser ? "Personal actualizado con éxito" : "Personal registrado con éxito");
        setIsFormOpen(false);
        fetchUsers();
      } else {
        const errorData = await resp.json();
        alert(`Error: ${errorData.message || 'No se pudo guardar el usuario'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userIdToDelete) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario con ID "${userIdToDelete}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/users/${userIdToDelete}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (resp.ok) {
        alert("Usuario eliminado correctamente");
        fetchUsers();
        if (editingUser && editingUser.id === userIdToDelete) {
          setIsFormOpen(false);
        }
      } else {
        alert("No se pudo eliminar el usuario");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
      {/* Cabecera general */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 className="gold-text" style={{ fontSize: '1.2rem', letterSpacing: '2px', margin: 0, marginBottom: '5px' }}>👤 GESTIÓN DE PERSONAL Y JOYEROS</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Crea, edita, configura contraseñas y preguntas de seguridad para el personal del taller.</p>
        </div>
        <button onClick={openCreateForm} className="action-btn-gold" style={{ width: 'auto', padding: '12px 25px', borderRadius: '8px' }}>
          <Plus size={16} /> REGISTRAR NUEVO
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isFormOpen ? '1.2fr 1fr' : '1fr', gap: '25px', transition: 'all 0.3s' }}>
        {/* Lado Izquierdo: Lista de Usuarios */}
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '25px' }}>
          <h3 className="gold-text" style={{ fontSize: '1rem', marginBottom: '20px', letterSpacing: '1px' }}>PERSONAL REGISTRADO</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--gold)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 10px' }}>Usuario / Cédula</th>
                <th style={{ padding: '12px 10px' }}>Nombre</th>
                <th style={{ padding: '12px 10px' }}>Rol</th>
                <th style={{ padding: '12px 10px' }}>Contacto</th>
                <th style={{ padding: '12px 10px' }}>Estado</th>
                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', transition: 'background 0.2s' }} className="hover-bg-subtle">
                  <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>
                    <code>{user.id}</code>
                  </td>
                  <td style={{ padding: '12px 10px' }}>{user.name}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: user.phone ? 'white' : '#666' }}>
                    {user.phone || 'Sin teléfono'}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`status-badge status-${user.status === 'Fuera de Turno' ? 'offline' : user.status === 'Disponible' ? 'available' : user.status === 'En Proceso' ? 'working' : 'paused'}`} style={{ fontSize: '0.7rem' }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => openEditForm(user)} className="premium-btn" style={{ padding: '6px 12px', fontSize: '0.7rem', borderColor: 'var(--border-glass)' }}>
                      <Edit3 size={12} /> Editar
                    </button>
                    {user.name !== 'Viralsquad' && (
                      <button onClick={() => handleDelete(user.id)} className="premium-btn" style={{ padding: '6px 12px', fontSize: '0.7rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}>
                        <Trash2 size={12} /> Borrar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lado Derecho: Formulario (Creación/Edición) */}
        {isFormOpen && (
          <div className="glass-panel animate-fade-in" style={{ borderLeft: '4px solid var(--gold)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
              <div>
                <h3 className="gold-text" style={{ fontSize: '1.1rem', margin: 0 }}>
                  {editingUser ? `EDITAR PERSONAL: ${editingUser.name}` : 'REGISTRAR NUEVO PERSONAL'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '4px' }}>
                  {editingUser ? 'Los cambios aplicarán al instante.' : 'Define credenciales y preguntas de seguridad.'}
                </p>
              </div>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Cédula/ID */}
              <div className="weight-row" style={editingUser ? { background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' } : {}}>
                <label style={editingUser ? { color: '#888' } : {}}>CÉDULA / ID ACCESO</label>
                <input 
                  type="text" 
                  value={userId} 
                  onChange={e => setUserId(e.target.value)} 
                  placeholder="Ej: 102030"
                  disabled={!!editingUser}
                  required
                  style={{ width: '150px', fontSize: '1.1rem', borderBottom: editingUser ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Nombre */}
              <div className="weight-row">
                <label>NOMBRE COMPLETO</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Nombre y Apellido"
                  required
                  style={{ width: '180px', fontSize: '1.1rem' }}
                />
              </div>

              {/* Rol */}
              <div className="weight-row">
                <label>ROL DEL SISTEMA</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  className="minimal-select"
                  style={{ width: '150px', border: 'none', color: 'white', textAlign: 'right', direction: 'rtl', padding: '5px' }}
                >
                  <option value="Joyero">Joyero</option>
                  <option value="Lider de Taller">Líder de Taller</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Dueno">Dueño</option>
                </select>
              </div>

              {/* Contraseña / PIN */}
              <div className="weight-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Lock size={12} /> CONTRASEÑA / PIN</label>
                <input 
                  type="text" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Clave de entrada"
                  required
                  style={{ width: '120px', fontSize: '1.1rem', letterSpacing: '1px' }}
                />
              </div>

              {/* Teléfono */}
              <div className="weight-row subtle">
                <label>TELÉFONO (CONTACTO)</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="Ej: +573000000"
                  style={{ width: '150px', fontSize: '1rem' }}
                />
              </div>

              {/* Sección de Preguntas de Seguridad */}
              <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 className="gold-text" style={{ fontSize: '0.85rem', marginBottom: '15px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={14} /> CONFIGURAR PREGUNTAS DE SEGURIDAD (RECUPERACIÓN)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {/* Pregunta 1 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <select 
                      value={q1} 
                      onChange={e => setQ1(e.target.value)}
                      className="minimal-select"
                      style={{ fontSize: '0.75rem', width: '100%', marginBottom: '5px' }}
                    >
                      {SECURITY_QUESTIONS_POOL.map((q, idx) => <option key={idx} value={q}>{q}</option>)}
                    </select>
                    <input 
                      type="text"
                      placeholder="Respuesta a pregunta 1..."
                      value={a1}
                      onChange={e => setA1(e.target.value)}
                      required
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '6px', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>

                  {/* Pregunta 2 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <select 
                      value={q2} 
                      onChange={e => setQ2(e.target.value)}
                      className="minimal-select"
                      style={{ fontSize: '0.75rem', width: '100%', marginBottom: '5px' }}
                    >
                      {SECURITY_QUESTIONS_POOL.map((q, idx) => <option key={idx} value={q}>{q}</option>)}
                    </select>
                    <input 
                      type="text"
                      placeholder="Respuesta a pregunta 2..."
                      value={a2}
                      onChange={e => setA2(e.target.value)}
                      required
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '6px', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>

                  {/* Pregunta 3 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <select 
                      value={q3} 
                      onChange={e => setQ3(e.target.value)}
                      className="minimal-select"
                      style={{ fontSize: '0.75rem', width: '100%', marginBottom: '5px' }}
                    >
                      {SECURITY_QUESTIONS_POOL.map((q, idx) => <option key={idx} value={q}>{q}</option>)}
                    </select>
                    <input 
                      type="text"
                      placeholder="Respuesta a pregunta 3..."
                      value={a3}
                      onChange={e => setA3(e.target.value)}
                      required
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '6px', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Botón guardar */}
              <button type="submit" className="action-btn-gold" style={{ marginTop: '10px' }}>
                <CheckCircle size={18} /> {editingUser ? 'GUARDAR CAMBIOS' : 'CONFIRMAR REGISTRO'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
