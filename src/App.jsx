import { useState } from 'react';
import { initialEmployees } from './data';
import './index.css';

function App() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showSalaryForm, setShowSalaryForm] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const calculateSeniority = (joinDateStr) => {
    if (!joinDateStr) return '0 años, 0 meses';
    const joinDate = new Date(joinDateStr);
    const currentDate = new Date();
    let years = currentDate.getFullYear() - joinDate.getFullYear();
    let months = currentDate.getMonth() - joinDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} año(s), ${months} mes(es)`;
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const handleSaveEmployee = (e, formData) => {
    e.preventDefault();
    if (selectedEmployee) {
      setEmployees(employees.map(emp => emp.id === selectedEmployee.id ? { ...emp, ...formData } : emp));
    } else {
      setEmployees([...employees, { ...formData, leaves: [], salaryHistory: [{ date: formData.joinDate, amount: formData.salary, reason: 'Ingreso inicial' }] }]);
    }
    setCurrentView('list');
  };

  const handleAddLeave = (e, leaveData) => {
    e.preventDefault();
    const newLeave = { ...leaveData, registrationDate: new Date().toISOString().split('T')[0] };
    setEmployees(employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        const updatedEmp = { ...emp, leaves: [...emp.leaves, newLeave] };
        setSelectedEmployee(updatedEmp);
        return updatedEmp;
      }
      return emp;
    }));
    setShowLeaveForm(false);
  };

  const handleAddSalary = (e, salaryData) => {
    e.preventDefault();
    setEmployees(employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        const updatedEmp = { 
          ...emp, 
          salary: salaryData.amount, 
          salaryHistory: [...emp.salaryHistory, salaryData] 
        };
        setSelectedEmployee(updatedEmp);
        return updatedEmp;
      }
      return emp;
    }));
    setShowSalaryForm(false);
  };

  const uniqueDepts = [...new Set(employees.map(e => e.department))];

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterDept('');
    setFilterStatus('');
  };

  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    const matchSearch = term === '' || 
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.id.toLowerCase().includes(term);
    const matchDept = filterDept === '' || emp.department === filterDept;
    const matchStatus = filterStatus === '' || 
      (filterStatus === 'active' ? emp.isActive : (filterStatus === 'inactive' ? !emp.isActive : true));
    
    return matchSearch && matchDept && matchStatus;
  });

  // Lógica de Indicadores y Dashboard
  const totalEmployees = filteredEmployees.length;
  const activeEmployees = filteredEmployees.filter(e => e.isActive).length;
  const inactiveEmployees = totalEmployees - activeEmployees;

  let totalLeaves = 0;
  let paidLeaves = 0;
  let unpaidLeaves = 0;
  const deptDistribution = {};

  filteredEmployees.forEach(emp => {
    totalLeaves += emp.leaves.length;
    emp.leaves.forEach(l => {
      if (l.type === 'Con goce de sueldo') paidLeaves++;
      else unpaidLeaves++;
    });
    deptDistribution[emp.department] = (deptDistribution[emp.department] || 0) + 1;
  });

  return (
    <div className="app-container">
      <header>
        <h1>RH Control IA</h1>
        {currentView !== 'list' && (
          <button className="btn btn-secondary" onClick={() => setCurrentView('list')}>
            Volver a la Lista
          </button>
        )}
      </header>

      {currentView === 'list' && (
        <>
          <div className="dashboard-grid">
            <div className="metric-card">
              <h4>Empleados</h4>
              <p className="value">{totalEmployees}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Activos: <strong style={{color: 'var(--success-color)'}}>{activeEmployees}</strong></span>
                <span>Inactivos: <strong style={{color: 'var(--danger-color)'}}>{inactiveEmployees}</strong></span>
              </div>
            </div>
            <div className="metric-card">
              <h4>Permisos</h4>
              <p className="value">{totalLeaves}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Con Goce: <strong>{paidLeaves}</strong></span>
                <span>Sin Goce: <strong>{unpaidLeaves}</strong></span>
              </div>
            </div>
            <div className="metric-card" style={{ padding: '1rem 1.5rem' }}>
              <h4>Por Departamento</h4>
              <ul className="dept-dist-list">
                {Object.entries(deptDistribution).map(([dept, count]) => (
                  <li key={dept}>
                    <span>{dept}</span>
                    <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="filter-bar">
            <div className="form-group" style={{ marginBottom: 0, flex: '1' }}>
              <label>Buscar</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Nombre, correo o No. Emp..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Departamento</label>
              <select className="form-control" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="">Todos</option>
                {uniqueDepts.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Estatus</label>
              <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={handleClearFilters}>Limpiar Filtros</button>
              <button className="btn btn-primary" onClick={() => { setSelectedEmployee(null); setCurrentView('form'); }}>
                + Nuevo Empleado
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>No. Emp</th>
                  <th>Nombre</th>
                  <th>Departamento</th>
                  <th>Puesto</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>
                      <span className={`badge ${emp.isActive ? 'active' : 'inactive'}`}>
                        {emp.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary" onClick={() => { setSelectedEmployee(emp); setShowLeaveForm(false); setShowSalaryForm(false); setCurrentView('detail'); }}>Ver</button>
                        <button className="btn btn-primary" onClick={() => { setSelectedEmployee(emp); setCurrentView('form'); }}>Editar</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(emp.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No hay empleados que coincidan con la búsqueda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {currentView === 'form' && (
        <div className="card">
          <h2>{selectedEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
          <EmployeeForm 
            initialData={selectedEmployee} 
            employees={employees}
            onSave={handleSaveEmployee} 
            onCancel={() => setCurrentView('list')} 
          />
        </div>
      )}

      {currentView === 'detail' && selectedEmployee && (
        <>
          <div className="card">
            <h2>Información General</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Número de Empleado</label>
                <p>{selectedEmployee.id}</p>
              </div>
              <div className="detail-item">
                <label>Nombre Completo</label>
                <p>{selectedEmployee.name}</p>
              </div>
              <div className="detail-item">
                <label>Correo Electrónico</label>
                <p>{selectedEmployee.email}</p>
              </div>
              <div className="detail-item">
                <label>Departamento</label>
                <p>{selectedEmployee.department}</p>
              </div>
              <div className="detail-item">
                <label>Puesto</label>
                <p>{selectedEmployee.position}</p>
              </div>
              <div className="detail-item">
                <label>Estatus</label>
                <p>
                  <span className={`badge ${selectedEmployee.isActive ? 'active' : 'inactive'}`}>
                    {selectedEmployee.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
              <div className="detail-item">
                <label>Fecha de Ingreso</label>
                <p>{selectedEmployee.joinDate}</p>
              </div>
              <div className="detail-item">
                <label>Antigüedad</label>
                <p style={{ color: 'var(--primary-color)' }}>{calculateSeniority(selectedEmployee.joinDate)}</p>
              </div>
              <div className="detail-item">
                <label>Salario Vigente</label>
                <p style={{ color: 'var(--success-color)' }}>${Number(selectedEmployee.salary).toLocaleString('es-MX')}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="sub-header" style={{ marginTop: 0 }}>
              <h3 style={{ margin: 0 }}>Historial de Permisos</h3>
              <button className="btn btn-secondary" onClick={() => setShowLeaveForm(!showLeaveForm)}>
                {showLeaveForm ? 'Cancelar' : '+ Registrar Permiso'}
              </button>
            </div>
            
            {showLeaveForm && (
              <div style={{ marginBottom: '1.5rem', marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <LeaveForm existingLeaves={selectedEmployee.leaves} onSave={handleAddLeave} />
              </div>
            )}

            {selectedEmployee.leaves.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No hay permisos registrados.</p>
            ) : (
              <ul className="history-list" style={{ marginTop: '1rem' }}>
                {[...selectedEmployee.leaves].reverse().map((leave, idx) => (
                  <li key={idx} style={{ flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>{leave.type}</strong> ({leave.startDate} al {leave.endDate})</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registrado el: {leave.registrationDate || 'N/A'}</span>
                    </div>
                    {leave.reason && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Motivo: {leave.reason}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <div className="sub-header" style={{ marginTop: 0 }}>
              <h3 style={{ margin: 0 }}>Historial Salarial</h3>
              <button className="btn btn-secondary" onClick={() => setShowSalaryForm(!showSalaryForm)}>
                {showSalaryForm ? 'Cancelar' : '+ Registrar Aumento'}
              </button>
            </div>

            {showSalaryForm && (
              <div style={{ marginBottom: '1.5rem', marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <SalaryForm currentSalary={selectedEmployee.salary} onSave={handleAddSalary} />
              </div>
            )}

            <ul className="history-list" style={{ marginTop: '1rem' }}>
              {[...selectedEmployee.salaryHistory].reverse().map((hist, idx) => (
                <li key={idx} style={{ flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Fecha Efectiva: {hist.date}</span>
                    <strong>${Number(hist.amount).toLocaleString('es-MX')}</strong>
                  </div>
                  {hist.reason && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Motivo: {hist.reason}
                      {hist.increaseMode && ` (Incremento: ${hist.increaseValue}${hist.increaseMode === 'percentage' ? '%' : ' MXN'})`}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function EmployeeForm({ initialData, employees, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    id: '', name: '', email: '', department: '', position: '', joinDate: '', salary: '', isActive: true
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.id.trim()) newErrors.id = 'El número de empleado es obligatorio.';
    if (!formData.name.trim()) newErrors.name = 'El nombre completo es obligatorio.';
    if (!formData.email.trim()) newErrors.email = 'El correo electrónico es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'El formato de correo no es válido.';
    
    if (!formData.department.trim()) newErrors.department = 'El departamento es obligatorio.';
    if (!formData.position.trim()) newErrors.position = 'El puesto es obligatorio.';
    
    if (!formData.joinDate) newErrors.joinDate = 'La fecha de ingreso es obligatoria.';
    else {
      const selectedDate = new Date(formData.joinDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) newErrors.joinDate = 'La fecha de ingreso no puede ser futura.';
    }

    if (!formData.salary) newErrors.salary = 'El salario es obligatorio.';
    else if (Number(formData.salary) <= 0) newErrors.salary = 'El salario debe ser mayor a 0.';

    if (!initialData && employees.some(emp => emp.id === formData.id.trim())) {
      newErrors.id = 'Este número de empleado ya existe.';
    }
    if (employees.some(emp => emp.email.trim().toLowerCase() === formData.email.trim().toLowerCase() && emp.id !== formData.id)) {
      newErrors.email = 'Este correo electrónico ya está registrado.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(e, formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label>Número de Empleado *</label>
          <input type="text" className={`form-control ${errors.id ? 'input-error' : ''}`} name="id" value={formData.id} onChange={handleChange} disabled={!!initialData} />
          {errors.id && <span className="error-message">{errors.id}</span>}
        </div>
        <div className="form-group">
          <label>Nombre Completo *</label>
          <input type="text" className={`form-control ${errors.name ? 'input-error' : ''}`} name="name" value={formData.name} onChange={handleChange} />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Correo Electrónico *</label>
          <input type="email" className={`form-control ${errors.email ? 'input-error' : ''}`} name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label>Departamento *</label>
          <input type="text" className={`form-control ${errors.department ? 'input-error' : ''}`} name="department" value={formData.department} onChange={handleChange} />
          {errors.department && <span className="error-message">{errors.department}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Puesto *</label>
          <input type="text" className={`form-control ${errors.position ? 'input-error' : ''}`} name="position" value={formData.position} onChange={handleChange} />
          {errors.position && <span className="error-message">{errors.position}</span>}
        </div>
        <div className="form-group">
          <label>Fecha de Ingreso *</label>
          <input type="date" className={`form-control ${errors.joinDate ? 'input-error' : ''}`} name="joinDate" value={formData.joinDate} onChange={handleChange} />
          {errors.joinDate && <span className="error-message">{errors.joinDate}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Salario Vigente *</label>
          <input type="number" className={`form-control ${errors.salary ? 'input-error' : ''}`} name="salary" value={formData.salary} onChange={handleChange} min="1" />
          {errors.salary && <span className="error-message">{errors.salary}</span>}
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ marginRight: '0.5rem', width: '1.2rem', height: '1.2rem' }} />
            Empleado Activo
          </label>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="submit" className="btn btn-success">Guardar Empleado</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

function LeaveForm({ existingLeaves, onSave }) {
  const [leaveData, setLeaveData] = useState({ type: 'Con goce de sueldo', startDate: '', endDate: '', reason: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setLeaveData({ ...leaveData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!leaveData.startDate) newErrors.startDate = 'La fecha inicio es obligatoria.';
    if (!leaveData.endDate) newErrors.endDate = 'La fecha fin es obligatoria.';
    
    let isValidDates = true;
    if (leaveData.startDate && leaveData.endDate) {
      const start = new Date(leaveData.startDate);
      const end = new Date(leaveData.endDate);
      if (end < start) {
        newErrors.endDate = 'La fecha fin no puede ser anterior a la fecha de inicio.';
        isValidDates = false;
      }
    }
    
    if (isValidDates && leaveData.startDate && leaveData.endDate) {
      const newStart = new Date(leaveData.startDate).getTime();
      const newEnd = new Date(leaveData.endDate).getTime();
      
      const hasOverlap = existingLeaves.some(leave => {
        const eStart = new Date(leave.startDate).getTime();
        const eEnd = new Date(leave.endDate).getTime();
        return newStart <= eEnd && newEnd >= eStart;
      });

      if (hasOverlap) {
        newErrors.startDate = 'Existe un traslape con otro permiso en estas fechas.';
      }
    }

    if (!leaveData.reason.trim()) newErrors.reason = 'El motivo es obligatorio.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(e, leaveData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label>Tipo de Permiso *</label>
          <select className="form-control" name="type" value={leaveData.type} onChange={handleChange}>
            <option value="Con goce de sueldo">Con goce de sueldo</option>
            <option value="Sin goce de sueldo">Sin goce de sueldo</option>
          </select>
        </div>
        <div className="form-group">
          <label>Fecha Inicio *</label>
          <input type="date" className={`form-control ${errors.startDate ? 'input-error' : ''}`} name="startDate" value={leaveData.startDate} onChange={handleChange} />
          {errors.startDate && <span className="error-message">{errors.startDate}</span>}
        </div>
        <div className="form-group">
          <label>Fecha Fin *</label>
          <input type="date" className={`form-control ${errors.endDate ? 'input-error' : ''}`} name="endDate" value={leaveData.endDate} onChange={handleChange} />
          {errors.endDate && <span className="error-message">{errors.endDate}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group" style={{ flex: '1 1 100%' }}>
          <label>Motivo *</label>
          <input type="text" className={`form-control ${errors.reason ? 'input-error' : ''}`} name="reason" value={leaveData.reason} onChange={handleChange} />
          {errors.reason && <span className="error-message">{errors.reason}</span>}
        </div>
      </div>
      <button type="submit" className="btn btn-success">Guardar Permiso</button>
    </form>
  );
}

function SalaryForm({ currentSalary, onSave }) {
  const [salaryData, setSalaryData] = useState({ 
    increaseMode: 'amount', 
    increaseValue: '', 
    date: '', 
    reason: '' 
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setSalaryData({ ...salaryData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const calculateNewSalary = () => {
    const val = Number(salaryData.increaseValue) || 0;
    const base = Number(currentSalary);
    if (salaryData.increaseMode === 'amount') return base + val;
    return base + (base * (val / 100));
  };

  const validate = () => {
    const newErrors = {};
    const val = Number(salaryData.increaseValue);
    
    if (!salaryData.increaseValue) {
      newErrors.increaseValue = 'El monto/porcentaje es obligatorio.';
    } else if (val <= 0) {
      newErrors.increaseValue = 'El aumento debe ser mayor a cero.';
    }

    const newSal = calculateNewSalary();
    if (newSal <= Number(currentSalary)) {
      newErrors.increaseValue = 'El nuevo salario debe ser mayor al vigente.';
    }

    if (!salaryData.date) newErrors.date = 'La fecha de aplicación es obligatoria.';
    if (!salaryData.reason.trim()) newErrors.reason = 'El motivo es obligatorio.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(e, {
        amount: calculateNewSalary(),
        previousSalary: currentSalary,
        increaseValue: salaryData.increaseValue,
        increaseMode: salaryData.increaseMode,
        date: salaryData.date,
        reason: salaryData.reason
      });
    }
  };

  const newSalaryPreview = calculateNewSalary();

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Salario actual: ${Number(currentSalary).toLocaleString('es-MX')}</p>
      
      <div className="form-row">
        <div className="form-group">
          <label>Tipo de Aumento *</label>
          <select className="form-control" name="increaseMode" value={salaryData.increaseMode} onChange={handleChange}>
            <option value="amount">Monto Fijo ($)</option>
            <option value="percentage">Porcentaje (%)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Valor del Aumento *</label>
          <input type="number" className={`form-control ${errors.increaseValue ? 'input-error' : ''}`} name="increaseValue" value={salaryData.increaseValue} onChange={handleChange} min="1" step="any" />
          {errors.increaseValue && <span className="error-message">{errors.increaseValue}</span>}
        </div>
        <div className="form-group">
          <label>Nuevo Salario Calculado</label>
          <input type="text" className="form-control" value={`$${newSalaryPreview.toLocaleString('es-MX')}`} disabled style={{ backgroundColor: '#f9fafb' }} />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Fecha de Aplicación *</label>
          <input type="date" className={`form-control ${errors.date ? 'input-error' : ''}`} name="date" value={salaryData.date} onChange={handleChange} />
          {errors.date && <span className="error-message">{errors.date}</span>}
        </div>
        <div className="form-group" style={{ flex: '2' }}>
          <label>Motivo *</label>
          <input type="text" className={`form-control ${errors.reason ? 'input-error' : ''}`} name="reason" value={salaryData.reason} onChange={handleChange} />
          {errors.reason && <span className="error-message">{errors.reason}</span>}
        </div>
      </div>
      <button type="submit" className="btn btn-success">Guardar Aumento</button>
    </form>
  );
}

export default App;
