# React Syntax Deep Dive & Comprehensive Reference Manual

This document provides a thorough, line-by-line and concept-by-concept breakdown of React syntax, how the JavaScript engine and React runtime interpret it, and how it is applied throughout this codebase.

---

## Table of Contents
1. [Core Mental Model: What is React?](#1-core-mental-model-what-is-react)
2. [JSX: JavaScript XML in Depth](#2-jsx-javascript-xml-in-depth)
   - [What JSX is and How It Compiles](#what-jsx-is-and-how-it-compiles)
   - [JSX Rules & Gotchas](#jsx-rules--gotchas)
   - [Expressions & Curly Braces `{}`](#expressions--curly-braces-)
   - [Fragments `<>` and `<React.Fragment>`](#fragments--and-reactfragment)
3. [Components: Building Blocks of UI](#3-components-building-blocks-of-ui)
   - [Function Component Anatomy](#function-component-anatomy)
   - [Arrow Functions vs Standard Declarations](#arrow-functions-vs-standard-declarations)
   - [The Return Statement & Parentheses](#the-return-statement--parentheses)
4. [Props: Passing Data Down the Tree](#4-props-passing-data-down-the-tree)
   - [Prop Passing & Destructuring](#prop-passing--destructuring)
   - [Default Props & Optional Chaining](#default-props--optional-chaining)
   - [The Special `children` Prop](#the-special-children-prop)
   - [Passing Functions as Props (Callbacks)](#passing-functions-as-props-callbacks)
5. [State: Component Memory with Hooks](#5-state-component-memory-with-hooks)
   - [`useState` Hook Mechanics](#usestate-hook-mechanics)
   - [Why You Never Mutate State Directly](#why-you-never-mutate-state-directly)
   - [Functional Updates: `setState(prev => ...)` ](#functional-updates-setstateprev--)
   - [Lazy / Functional Initial State](#lazy--functional-initial-state)
6. [Effects: Synchronizing with the Outside World](#6-effects-synchronizing-with-the-outside-world)
   - [`useEffect` Hook Syntax](#useeffect-hook-syntax)
   - [The Dependency Array Explained](#the-dependency-array-explained)
   - [Cleanup Functions (Unmounting & Re-subscribing)](#cleanup-functions-unmounting--re-subscribing)
7. [Context API: Global State Without Prop Drilling](#7-context-api-global-state-without-prop-drilling)
   - [`createContext()` & `<Context.Provider>`](#createcontext--contextprovider)
   - [`useContext()` & Custom Hook Patterns (`useAuth`)](#usecontext--custom-hook-patterns-useauth)
8. [Conditional Rendering Syntax](#8-conditional-rendering-syntax)
   - [Ternary Operator `condition ? A : B`](#ternary-operator-condition--a--b)
   - [Logical AND `condition && <Component />`](#logical-and-condition--component-)
   - [Early Returns / Guard Clauses](#early-returns--guard-clauses)
9. [List Rendering & The `key` Prop](#9-list-rendering--the-key-prop)
   - [The `.map()` Pattern](#the-map-pattern)
   - [Why Keys Matter (Reconciliation Algorithm)](#why-keys-matter-reconciliation-algorithm)
   - [Why Index as Key is Dangerous](#why-index-as-key-is-dangerous)
10. [Event Handling Syntax](#10-event-handling-syntax)
    - [Synthetic Events (`e`) & `e.preventDefault()`](#synthetic-events-e--epreventdefault)
    - [Inline Arrow Callbacks vs Function References](#inline-arrow-callbacks-vs-function-references)
    - [Controlled Inputs (`value` + `onChange`)](#controlled-inputs-value--onchange)
11. [Routing Syntax: React Router DOM](#11-routing-syntax-react-router-dom)
    - [`<BrowserRouter>`, `<Routes>`, `<Route>`](#browserrouter-routes-route)
    - [`<Navigate replace />` & `<Link to="...">`](#navigate-replace--link-to)
    - [`useNavigate()` Hook](#usenavigate-hook)
12. [Real Code Walkthroughs from SubTracker](#12-real-code-walkthroughs-from-subtracker)

---

## 1. Core Mental Model: What is React?

In traditional vanilla JavaScript, updating the screen requires manual DOM manipulation:
```javascript
// Vanilla JS: Imperative (Telling browser step-by-step what to do)
const button = document.getElementById('btn');
button.innerText = 'Loading...';
button.disabled = true;
```

React uses a **Declarative** paradigm:
$$\text{UI} = f(\text{State})$$

You describe **what** the UI should look like for a given state. When state changes, React recalculates what needs to change in memory (the **Virtual DOM**) and efficiently updates only the changed elements in the real browser DOM (a process called **Reconciliation**).

---

## 2. JSX: JavaScript XML in Depth

### What JSX is and How It Compiles

**JSX** looks like HTML, but it is actually JavaScript syntax extension. Browsers **cannot** execute JSX directly. Build tools like Vite (using Babel or esbuild / SWC) compile JSX into pure JavaScript function calls.

#### Written JSX:
```jsx
const element = <h1 className="title">Hello {name}!</h1>;
```

#### What Vite/React 19 compiles it to behind the scenes:
```javascript
import { jsx as _jsx } from "react/jsx-runtime";

const element = _jsx("h1", {
  className: "title",
  children: ["Hello ", name, "!"]
});
```
Every JSX element produces a plain JavaScript object called a **React Element**:
```javascript
{
  type: 'h1',
  props: {
    className: 'title',
    children: ['Hello ', 'Krish', '!']
  },
  key: null,
  ref: null
}
```

---

### JSX Rules & Gotchas

1. **`class` becomes `className`**:
   In JavaScript, `class` is a reserved keyword for ES6 classes. Therefore, HTML's `class` attribute is written as `className` in JSX.
   ```jsx
   // WRONG in React
   <div class="card"></div>

   // CORRECT
   <div className="card"></div>
   ```

2. **`for` becomes `htmlFor`**:
   In JavaScript, `for` is a loop keyword. HTML `<label for="email">` becomes:
   ```jsx
   <label htmlFor="email">Email</label>
   <input id="email" />
   ```

3. **All tags MUST be closed**:
   In HTML5, `<input>` or `<img>` or `<br>` can be unclosed. In JSX, every tag must be self-closing or have a closing tag:
   ```jsx
   <input type="text" />
   <img src="/logo.svg" alt="Logo" />
   <br />
   ```

4. **Single Root Element**:
   A component can only return **one** single root element. This is because a JavaScript function can only return a single value.
   ```jsx
   // INVALID: Trying to return two values
   return (
     <h1>Title</h1>
     <p>Paragraph</p>
   );

   // VALID: Wrapped in a single container
   return (
     <div>
       <h1>Title</h1>
       <p>Paragraph</p>
     </div>
   );
   ```

---

### Expressions & Curly Braces `{}`

In JSX, anything inside `{}` is evaluated as a JavaScript expression (something that produces a value).

#### String Literals vs Expressions:
```jsx
// 1. Literal string prop (no curly braces needed)
<Button variant="primary" label="Save" />

// 2. JavaScript variable or number (MUST use curly braces)
<StatCard amount={monthlySpend} count={5} />

// 3. Boolean values (must use curly braces unless passing true by omission)
<Modal isOpen={true} />
<Modal isOpen />         // Equivalent shorthand for isOpen={true}

// 4. Object literal passed as prop (Double curlies {{}})
// Outer {} opens JS expression; inner {} is the JavaScript object!
<div style={{ backgroundColor: '#ffffff', padding: '12px' }} />

// 5. Template literals inside JSX
<p className={`badge ${isActive ? 'bg-green-500' : 'bg-red-500'}`}>
```

---

### Fragments `<>` and `<React.Fragment>`

When you need to return multiple sibling elements without adding an unnecessary `<div>` to the DOM (which might break CSS Flexbox or Grid layouts), use a **Fragment**:

```jsx
// Shorthand syntax:
return (
  <>
    <header>Header</header>
    <main>Main Content</main>
  </>
);

// Explicit syntax (needed if you must attach a key in a loop):
import { Fragment } from 'react';

{items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.description}</dd>
  </Fragment>
))}
```

---

## 3. Components: Building Blocks of UI

A React Component is a JavaScript function that receives an input object (`props`) and returns JSX.

### Function Component Anatomy

```jsx
// Component declaration
function Header(props) {
  return (
    <header className="site-header">
      <h1>{props.title}</h1>
    </header>
  );
}

// Exporting so other files can import it
export default Header;
```

**Rule of Component Naming**: Components **MUST** start with a **Capital Letter** (e.g., `Header`, `StatCards`, `SubscriptionTable`).
- `<button>` (lowercase) tells React: "This is a native HTML DOM element."
- `<Button>` (uppercase) tells React: "This is a custom React Component function; please call it."

---

### Arrow Functions vs Standard Declarations

Both forms are completely valid. Modern React codebases predominantly use arrow functions:

```jsx
// Arrow Function Component
const StatCards = ({ monthlySpend, annualSpend, activeSubs }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Cards */}
    </div>
  );
};

export default StatCards;
```

---

### The Return Statement & Parentheses

Why are parentheses `()` placed after `return`?
```jsx
// In JavaScript, automatic semicolon insertion (ASI) would break this:
return
  <div>Error! Unreachable code</div>; // JS inserts ';' right after return!

// Parentheses keep the multiline JSX connected to the return keyword:
return (
  <div>
    <h1>Safe and valid multiline JSX</h1>
  </div>
);
```

---

## 4. Props: Passing Data Down the Tree

Props (short for **properties**) are the arguments you pass into a component, similar to arguments passed into a function. **Props are read-only (immutable)**. A component must never modify its own props.

### Prop Passing & Destructuring

```jsx
// In App.jsx (Parent):
<StatCards
  monthlySpend={monthlySpend}
  annualSpend={annualSpend}
  activeSubs={activeSubs}
  loading={loading}
/>
```

Inside the child component, instead of referencing `props.monthlySpend`, we **destructure** the object directly in the function parameters:

```jsx
// Without destructuring:
const StatCards = (props) => {
  return <h2>Total: {props.monthlySpend}</h2>;
};

// With destructuring (cleaner & idiomatic):
const StatCards = ({ monthlySpend, annualSpend, activeSubs, loading }) => {
  return <h2>Total: {monthlySpend}</h2>;
};
```

---

### Default Props & Optional Chaining

You can assign default values directly in the destructured parameters:

```jsx
const SubscriptionTable = ({
  subscriptions = [],      // Default to empty array if undefined
  loading = false,          // Default to false
  deletingId = null,        // Default to null
}) => {
  // Safe from crashing on .length if subscriptions was not passed
  console.log(subscriptions.length);
};
```

#### Optional Chaining (`?.`)
Prevents runtime TypeError if an object is null or undefined:
```jsx
// If deleteTarget is null, deleteTarget.name would crash with:
// "TypeError: Cannot read properties of null (reading 'name')"
// Using deleteTarget?.name safely returns undefined instead:
<p>Are you sure you want to delete "{deleteTarget?.name}"?</p>
```

---

### The Special `children` Prop

Whenever you nest content inside a component tag, React automatically passes that nested content as a prop named `children`:

```jsx
// In Modal.jsx:
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="modal-content">
          {children} {/* Renders whatever is placed inside <Modal>...</Modal> */}
        </div>
      </div>
    </div>
  );
};
```

Usage in `App.jsx`:
```jsx
<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Subscription">
  {/* EVERYTHING HERE BECOMES `children` */}
  <SubscriptionForm onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
</Modal>
```

---

### Passing Functions as Props (Callbacks)

In React, data flows **down** via props, but events flow **up** via callbacks. This is called **Lifting State Up**.

```jsx
// Parent (App.jsx):
const handleEdit = (sub) => {
  setEditing(sub);
  setModalOpen(true);
};

// Pass function down as a prop:
<SubscriptionTable onEdit={handleEdit} />

// Child (SubscriptionTable.jsx):
const SubscriptionTable = ({ onEdit }) => {
  return (
    <button onClick={() => onEdit(sub)}>
      Edit
    </button>
  );
};
```
When the user clicks "Edit", the child calls `onEdit(sub)`, which executes `handleEdit` in the parent with the selected subscription object!

---

## 5. State: Component Memory with Hooks

Regular variables inside a function are reset every time the function re-runs:
```jsx
function Counter() {
  let count = 0; // Resets to 0 on every render!
  const increment = () => { count++; }; // Doesn't trigger a re-render!
}
```
To preserve data between renders and tell React to re-render the UI when the data changes, you must use **State**.

### `useState` Hook Mechanics

```jsx
import { useState } from 'react';

const [state, setState] = useState(initialValue);
```

#### Detailed Breakdown of Syntax:
1. `useState('Active')`: Calls the React hook with initial value `'Active'`.
2. It returns an array with exactly two elements:
   - Index 0: The current state value.
   - Index 1: The setter function used to update the state and trigger a re-render.
3. `[state, setState]`: JavaScript **array destructuring** to name those two elements whatever you want.

Example from `client/src/pages/LoginPage.jsx`:
```jsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

---

### Why You Never Mutate State Directly

```jsx
// ❌ CRITICAL BUG: NEVER MUTATE STATE DIRECTLY!
subscriptions.push(newSub);
setSubscriptions(subscriptions);
```
**Why this fails:**
React uses **shallow reference equality** (`Object.is(oldState, newState)`) to detect changes. Because `subscriptions` still points to the exact same array in memory, React thinks nothing changed and **skips the re-render**!

```jsx
// ✅ CORRECT: Create a new array or object (Immutability)
// Array spread operator:
setSubscriptions([...subscriptions, newSub]);

// Object spread operator:
setUser({ ...user, name: 'Krish' });
```

---

### Functional Updates: `setState(prev => ...)`

When your new state depends on the previous state, pass an updater function:

```jsx
// Example: Toggling a boolean
const toggleModal = () => {
  setModalOpen(prevOpen => !prevOpen);
};

// Example: Incrementing count safely
setCount(prevCount => prevCount + 1);
```
The updater function guarantees you are reading the freshest, most up-to-date state even if multiple state updates are batched together.

---

### Lazy / Functional Initial State

If calculating the initial state involves expensive computation or reading from `localStorage`, pass a function into `useState`:

```jsx
// From AuthContext.jsx:
const [user, setUser] = useState(() => {
  try {
    const savedUser = localStorage.getItem('subtracker_user');
    const savedToken = localStorage.getItem('subtracker_token');
    if (savedToken) {
      setAuthToken(savedToken);
    }
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
});
```
**Why pass a function `() => ...`?**
If you wrote `useState(localStorage.getItem(...))`, the browser would read `localStorage` on **every single re-render** of the component. Passing a function tells React: *"Only run this code ONCE when the component first mounts."*

---

## 6. Effects: Synchronizing with the Outside World

Components should ideally be pure functions: given props and state, return JSX.
Any operation that touches the outside world (fetching data from an API, setting timers, manually manipulating DOM, reading localStorage) is a **Side Effect**.

### `useEffect` Hook Syntax

```jsx
import { useEffect } from 'react';

useEffect(() => {
  // 1. Code to execute (Effect)

  return () => {
    // 2. Optional: Cleanup code
  };
}, [/* 3. Dependency Array */]);
```

---

### The Dependency Array Explained

The second argument to `useEffect` controls **when** the effect runs:

| Syntax | When it runs | Analogy |
|---|---|---|
| `useEffect(() => { ... })` *(No array)* | Runs after **every single render** | High risk of infinite loops if setting state |
| `useEffect(() => { ... }, [])` *(Empty array)* | Runs **only once** after the component first mounts | Like `componentDidMount` |
| `useEffect(() => { ... }, [filter, page])` | Runs on mount **AND** whenever `filter` or `page` changes | Watching specific values |

#### Real Example from `App.jsx`:
```jsx
// Runs only once when Dashboard mounts to load user subscriptions from backend
useEffect(() => {
  fetchSubscriptions();
}, []);
```

---

### Cleanup Functions (Unmounting & Re-subscribing)

If an effect sets up a subscription, an event listener, or a timer, it can return a **cleanup function**:

```jsx
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Add event listener to window
  window.addEventListener('keydown', handleKeyDown);

  // Cleanup: Runs when component unmounts or before re-running the effect
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [onClose]);
```
Without the cleanup function, every time the component unmounts and remounts, duplicate event listeners would accumulate, causing **memory leaks**.

---

## 7. Context API: Global State Without Prop Drilling

When multiple components far apart in the tree need the same data (like the logged-in user or active theme), passing props down through every intermediate component is called **Prop Drilling**. The Context API solves this.

```
       [ App ]
          |
    [ AuthProvider ]  <-- Holds global state (user, login, logout)
     /            \
[ LoginPage ]   [ Dashboard ]
                      \
                   [ Header ] <-- Can directly consume user without drilling!
```

### `createContext()` & `<Context.Provider>`

From `client/src/context/AuthContext.jsx`:
```jsx
import { createContext, useState } from 'react';

// 1. Create the Context object
const AuthContext = createContext(null);

// 2. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => { /* ... */ };
  const logout = () => { /* ... */ };

  return (
    // 3. Wrap children and pass data via 'value'
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

### `useContext()` & Custom Hook Patterns (`useAuth`)

Rather than having components import `AuthContext` and call `useContext(AuthContext)` everywhere, we create a clean custom hook:

```jsx
// Custom hook defined in AuthContext.jsx
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

Usage in any child component (e.g., `App.jsx`):
```jsx
import { useAuth } from './context/AuthContext';

const Dashboard = () => {
  // Grab user and logout directly with one clean line!
  const { user, logout } = useAuth();

  return (
    <span>Welcome, {user?.name}</span>
  );
};
```

---

## 8. Conditional Rendering Syntax

### Ternary Operator `condition ? A : B`

Use when you want to render one element if true, and a different element if false.

```jsx
// Example from LoginPage.jsx:
<button type="submit" disabled={loading}>
  {loading ? (
    <>
      <div className="spinner" />
      Signing in...
    </>
  ) : (
    'Sign In'
  )}
</button>
```

---

### Logical AND `condition && <Component />`

In JavaScript, `true && expression` evaluates to `expression`, while `false && expression` evaluates to `false` (which React ignores and does not render).

```jsx
// Render error alert ONLY if error string is not empty:
{error && (
  <div className="bg-red-50 text-red-700 p-3 rounded">
    <AlertCircle size={15} />
    {error}
  </div>
)}

// Render button ONLY if user is authorized:
{user?.isAdmin && <AdminPanel />}
```

> **Caution with Numbers:** In JavaScript, `0 && <Component />` evaluates to the number `0`, which React will print directly to the screen! Always use booleans:
> ```jsx
> // ❌ MIGHT PRINT '0' ON SCREEN IF ARRAY IS EMPTY:
> {items.length && <List items={items} />}
>
> // ✅ SAFE:
> {items.length > 0 && <List items={items} />}
> {Boolean(items.length) && <List items={items} />}
> ```

---

### Early Returns / Guard Clauses

Before returning the main JSX, you can return alternative UI early based on conditions (e.g., loading or error states):

```jsx
// From SubscriptionTable.jsx:
const SubscriptionTable = ({ subscriptions, loading }) => {
  // Guard 1: Loading state
  if (loading) {
    return <div className="spinner">Loading subscriptions...</div>;
  }

  // Guard 2: Empty state
  if (!subscriptions || subscriptions.length === 0) {
    return <div className="empty">No subscriptions found.</div>;
  }

  // Main UI (only reached if not loading and has data)
  return (
    <table>
      {/* Table rows */}
    </table>
  );
};
```

---

## 9. List Rendering & The `key` Prop

### The `.map()` Pattern

To transform an array of data into an array of JSX elements, use JavaScript's native `.map()`:

```jsx
const SUBSCRIPTIONS = [
  { _id: '1', name: 'Netflix', cost: 649 },
  { _id: '2', name: 'Spotify', cost: 119 },
];

return (
  <ul>
    {SUBSCRIPTIONS.map((sub) => (
      <li key={sub._id}>
        {sub.name} — ₹{sub.cost}
      </li>
    ))}
  </ul>
);
```

---

### Why Keys Matter (Reconciliation Algorithm)

React keeps track of list elements between renders using the `key` prop.
When an item is added, deleted, or reordered:
1. Without keys, React doesn't know which specific item moved. It may re-render and re-create every DOM element in the list.
2. With unique keys (e.g., MongoDB `sub._id`), React matches the old virtual element with the new one. It moves the exact DOM node without destroying its inner state or DOM focus.

---

### Why Index as Key is Dangerous

```jsx
// ❌ RISKY: Using array index as key
{subscriptions.map((sub, index) => (
  <SubscriptionRow key={index} sub={sub} />
))}
```
If you delete item 0, item 1 now becomes index 0. React compares key `0` with the old key `0` and assumes the item was modified rather than deleted, causing subtle UI bugs with inputs, animations, and checkboxes.
**Always use unique IDs from your database (`sub._id`).**

---

## 10. Event Handling Syntax

In HTML, event attributes are lowercase strings: `<button onclick="save()">`.
In React:
1. Event names are **camelCase**: `onClick`, `onChange`, `onSubmit`, `onKeyDown`.
2. You pass a **function reference**, not a string.

### Synthetic Events (`e`) & `e.preventDefault()`

React wraps native browser events in a cross-browser wrapper called `SyntheticEvent`.
In HTML, submitting a `<form>` triggers a full browser page refresh. To prevent this in a Single Page App (SPA):

```jsx
const handleSubmit = (e) => {
  e.preventDefault(); // Prevents full-page browser reload!
  // Send data using Axios instead
};
```

---

### Inline Arrow Callbacks vs Function References

```jsx
// Case 1: Function takes NO parameters
// Pass the function reference directly:
<button onClick={handleAdd}>Add</button>

// ❌ WRONG: Do NOT call the function immediately!
// This runs handleAdd immediately during render, NOT when clicked!
<button onClick={handleAdd()}>Add</button>

// Case 2: Function requires parameters (e.g., sub ID)
// Wrap in an inline arrow function:
<button onClick={() => handleDeleteClick(sub._id)}>Delete</button>
```

---

### Controlled Inputs (`value` + `onChange`)

In React, the "single source of truth" for form inputs is React state. An input whose value is controlled by React state is called a **Controlled Component**:

```jsx
const [email, setEmail] = useState('');

<input
  type="email"
  value={email} // 1. Input gets its display value from state
  onChange={(e) => setEmail(e.target.value)} // 2. When user types, state updates
/>
```
How the cycle works:
1. User types letter `'a'`.
2. Browser fires `onChange` event.
3. `e.target.value` contains `'a'`.
4. `setEmail('a')` is called.
5. Component re-renders with `email = 'a'`.
6. `<input>` renders showing `'a'`.

---

## 11. Routing Syntax: React Router DOM

This project uses `react-router-dom` v7 to manage client-side page transitions without page reloads.

### `<BrowserRouter>`, `<Routes>`, `<Route>`

```jsx
// In main.jsx:
<BrowserRouter>
  <App />
</BrowserRouter>

// In App.jsx:
<Routes>
  {/* Public route */}
  <Route path="/login" element={<LoginPage onLogin={login} />} />

  {/* Protected route */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  {/* Catch-all redirect */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

### `<Navigate replace />` & `<Link to="...">`

- `<Link to="/register">`: Renders an accessible `<a>` tag that intercepts browser clicks, updates the browser URL bar via HTML5 History API (`pushState`), and switches components **instantly without page reload**.
- `<Navigate to="/login" replace />`: Programmatic declarative redirection. `replace` replaces the current entry in the history stack so the back button doesn't bounce in a loop.

---

### `useNavigate()` Hook

Used for programmatic navigation after an asynchronous action (e.g., redirecting after login succeeds):

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const handleLogin = async () => {
  await login(email, password);
  navigate('/dashboard', { replace: true });
};
```

---

## 12. Real Code Walkthroughs from SubTracker

### Walkthrough 1: ProtectedRoute in `App.jsx`
```jsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // 1. Read global auth state

  if (loading) {
    return <div>Loading SubTracker...</div>; // 2. Guard against flash of login
  }

  if (!user) {
    return <Navigate to="/login" replace />; // 3. Redirect unauthenticated users
  }

  return children; // 4. Render protected dashboard if authenticated
};
```

### Walkthrough 2: Derived State in `App.jsx`
```jsx
// Notice: We do NOT create separate useState for filteredSubscriptions!
// Calculating it during render prevents state desynchronization:
const filteredSubscriptions = subscriptions.filter((sub) => {
  if (filters.search) {
    const nameLower = (sub.name || '').toLowerCase();
    const searchLower = filters.search.toLowerCase().trim();
    if (!nameLower.includes(searchLower)) return false;
  }
  return true;
});
```

---
*This document serves as the complete syntax reference for all frontend React implementations in the SubTracker repository.*
