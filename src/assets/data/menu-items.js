export const MENU_ITEMS = [{
  key: 'menu',
  label: 'Main',
  isTitle: true
}, {
  key: 'dashboard',
  icon: 'ri:dashboard-2-line',
  label: 'Dashboard',
  badge: {
    text: '9+',
    variant: 'success'
  },
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