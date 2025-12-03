import { MENU_ITEMS } from '@/assets/data/menu-items';
import { getUserRole } from '@/lib/auth/tokenManager';

export const getMenuItems = () => {
  const userRole = getUserRole();
  
  // Filter menu items based on user role
  const filteredItems = MENU_ITEMS.filter(item => {
    // If item has requiredRole, check if user has that role
    if (item.requiredRole) {
      return userRole === item.requiredRole;
    }
    // If no requiredRole specified, show to everyone
    return true;
  });
  
  return filteredItems;
};
export const findAllParent = (menuItems, menuItem) => {
  let parents = [];
  const parent = findMenuItem(menuItems, menuItem.parentKey);
  if (parent) {
    parents.push(parent.key);
    if (parent.parentKey) {
      parents = [...parents, ...findAllParent(menuItems, parent)];
    }
  }
  return parents;
};
export const getMenuItemFromURL = (items, url) => {
  if (items instanceof Array) {
    for (const item of items) {
      const foundItem = getMenuItemFromURL(item, url);
      if (foundItem) {
        return foundItem;
      }
    }
  } else {
    if (items.url == url) return items;
    if (items.children != null) {
      for (const item of items.children) {
        if (item.url == url) return item;
      }
    }
  }
};
export const findMenuItem = (menuItems, menuItemKey) => {
  if (menuItems && menuItemKey) {
    for (const item of menuItems) {
      if (item.key === menuItemKey) {
        return item;
      }
      const found = findMenuItem(item.children, menuItemKey);
      if (found) return found;
    }
  }
  return null;
};