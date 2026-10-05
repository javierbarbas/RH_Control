export const initialEmployees = [
  {
    id: 'EMP-001',
    name: 'Ana García López',
    email: 'ana.garcia@ficticia.com',
    department: 'Recursos Humanos',
    position: 'Gerente de RH',
    joinDate: '2020-01-15',
    salary: 35000,
    isActive: true,
    leaves: [],
    salaryHistory: [{ date: '2020-01-15', amount: 35000 }]
  },
  {
    id: 'EMP-002',
    name: 'Carlos Mendoza Ruiz',
    email: 'carlos.mendoza@ficticia.com',
    department: 'Tecnología',
    position: 'Desarrollador Senior',
    joinDate: '2019-03-10',
    salary: 45000,
    isActive: true,
    leaves: [],
    salaryHistory: [{ date: '2019-03-10', amount: 45000 }]
  },
  {
    id: 'EMP-003',
    name: 'Laura Sánchez Pérez',
    email: 'laura.sanchez@ficticia.com',
    department: 'Ventas',
    position: 'Ejecutiva de Cuentas',
    joinDate: '2021-06-01',
    salary: 25000,
    isActive: true,
    leaves: [{ type: 'Con goce de sueldo', startDate: '2023-01-10', endDate: '2023-01-15' }],
    salaryHistory: [{ date: '2021-06-01', amount: 25000 }]
  },
  {
    id: 'EMP-004',
    name: 'Miguel Ángel Torres',
    email: 'miguel.torres@ficticia.com',
    department: 'Marketing',
    position: 'Diseñador Gráfico',
    joinDate: '2022-11-20',
    salary: 20000,
    isActive: false,
    leaves: [],
    salaryHistory: [{ date: '2022-11-20', amount: 20000 }]
  },
  {
    id: 'EMP-005',
    name: 'Sofía Castro Valle',
    email: 'sofia.castro@ficticia.com',
    department: 'Tecnología',
    position: 'Soporte Técnico',
    joinDate: '2023-02-14',
    salary: 18000,
    isActive: true,
    leaves: [{ type: 'Sin goce de sueldo', startDate: '2023-08-01', endDate: '2023-08-30' }],
    salaryHistory: [{ date: '2023-02-14', amount: 18000 }]
  },
  {
    id: 'EMP-006',
    name: 'Fernando Vargas',
    email: 'fernando.vargas@ficticia.com',
    department: 'Finanzas',
    position: 'Analista Financiero',
    joinDate: '2018-09-05',
    salary: 30000,
    isActive: true,
    leaves: [],
    salaryHistory: [{ date: '2018-09-05', amount: 30000 }]
  }
];
