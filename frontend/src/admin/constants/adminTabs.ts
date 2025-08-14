import AdminOverview from '../tabs/overview/AdminOverview';
import AdminClasses from '../tabs/classes/AdminClasses';
import AdminShop from '../tabs/shop/AdminShop';
import AdminContact from '../tabs/contact/AdminContact';

export const ADMIN_TABS = [
  { key: 'overview', label: 'סקירה', component: AdminOverview },
  { key: 'classes', label: 'שיעורים', component: AdminClasses },
  { key: 'shop', label: 'מוצרים/חנות', component: AdminShop },
  { key: 'contact', label: 'יצירת קשר', component: AdminContact },
] as const;

export type AdminTabKey = typeof ADMIN_TABS[number]['key']; 