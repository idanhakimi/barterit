/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AccessibilityStatement from './pages/AccessibilityStatement';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import MyDashboard from './pages/MyDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import Ratings from './pages/Ratings';
import Schedule from './pages/Schedule';
import Search from './pages/Search';
import TermsOfService from './pages/TermsOfService';
import dashboard from './pages/dashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AccessibilityStatement": AccessibilityStatement,
    "AdminDashboard": AdminDashboard,
    "AdminLogin": AdminLogin,
    "AdminPanel": AdminPanel,
    "Blog": Blog,
    "BlogPost": BlogPost,
    "Chat": Chat,
    "Dashboard": Dashboard,
    "Home": Home,
    "MyDashboard": MyDashboard,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "Ratings": Ratings,
    "Schedule": Schedule,
    "Search": Search,
    "TermsOfService": TermsOfService,
    "dashboard": dashboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};