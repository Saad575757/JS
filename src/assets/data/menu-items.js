export const MENU_ITEMS = [{
  key: 'menu',
  label: 'Main',
  isTitle: true
}, {
  key: 'dashboard',
  icon: 'ri:dashboard-2-line',
  label: 'Dashboard',
  url: '/dashboard'
}, {
  key: 'apps',
  label: 'App',
  isTitle: true
}, 
{
  key: 'apps-classes',
  icon: 'ri:calendar-line',
  label: 'Classes',
  url: '/apps/classes'
},
 {
  key: 'apps-kanban',
  icon: 'ri:artboard-line',
  label: 'Archived Classes',
  url: '/apps/kanban'
},
{
  key: 'apps-automation',
  icon: 'ri:robot-2-line',
  label: 'Workflow Automation',
  url: '/apps/automation',
  requiredRole: 'teacher' // Only teachers can see this
}, 
// {
//   key: 'apps-invoices',
//   icon: 'ri:article-line',
//   label: 'Invoice',
//   children: [{
//     key: 'invoices-report',
//     label: 'Invoice Report',
//     url: '/apps/invoices/report',
//     parentKey: 'apps-invoices'
//   }, 
//   {
//     key: 'invoice',
//     label: 'Invoice',
//     url: '/apps/invoices/349122',
//     parentKey: 'apps-invoices'
//   }]
// }, 

];