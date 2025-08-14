
import type { Platform, CodeError, Solution, User, Project, PrInfo, PrFile, FileSystemNode } from './types';

export const CODE_TEMPLATES: Record<Platform, string> = {
  web: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    // Potential error: items[i] might be undefined
    total += items[i].price * items[i].quantity;
  }
  return total;
}

// Missing semicolon
const cart = [
  { price: 10, quantity: 2 },
  { price: 15, quantity: 1 },
  // Missing properties
  { name: "Book" }
]

// Unused variable
let unusedVar = "This variable is never used";

// Function call with wrong parameters
calculateTotal();`,
    
  android: `package com.firefly.demo;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
import java.util.List;
import java.util.ArrayList;

public class MainActivity extends Activity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        TextView textView = findViewById(R.id.textView);
        
        // Potential null pointer exception
        List<Item> items = getItems();
        double total = calculateTotal(items);
        
        // Missing null check
        textView.setText("Total: $" + total);
    }
    
    public double calculateTotal(List<Item> items) {
        double total = 0;
        for (int i = 0; i < items.size(); i++) {
            // Potential IndexOutOfBoundsException
            Item item = items.get(i);
            total += item.price * item.quantity;
        }
        return total;
    }
    
    private List<Item> getItems() {
        // Might return null
        return null;
    }
    
    public class Item {
        double price;
        int quantity;
        
        public Item(double price, int quantity) {
            this.price = price;
            this.quantity = quantity;
        }
    }
}`,

  flutter: `import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: MyHomePage(title: 'Flutter Demo'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);
  
  // Missing required 'Key?' for null safety
  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;
  List<Item> _items;  // Should be nullable

  void _incrementCounter() {
    setState(() {
      _counter++;
      // Potential null reference
      _items.add(Item(price: 10.0, quantity: _counter));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Center(
        child: Text('You have pushed the button $_counter times'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        child: Icon(Icons.add),
      ),
    );
  }
}

class Item {
  final double price;
  final int quantity;
  
  Item({required this.price, required this.quantity});
}`
};

export const PLATFORM_ERRORS: Record<Platform, CodeError[]> = {
  web: [
    { id: 1, line: 4, column: 5, message: "Potential null pointer exception: items[i] might be undefined", severity: "error", type: "runtime", code: "total += items[i].price * items[i].quantity;" },
    { id: 2, line: 13, column: 1, message: "Missing semicolon at end of statement", severity: "warning", type: "syntax", code: '{ name: "Book" }' },
    { id: 3, line: 16, column: 5, message: "Unused variable: unusedVar", severity: "info", type: "logical", code: 'let unusedVar = "This variable is never used";' },
    { id: 4, line: 19, column: 1, message: "Function 'calculateTotal' called with 0 arguments, but expected 1.", severity: "error", type: "runtime", code: "calculateTotal();" },
  ],
  android: [
    { id: 1, line: 15, column: 9, message: "Potential NullPointerException: getItems() may return null", severity: "error", type: "runtime", code: "List<Item> items = getItems();" },
    { id: 2, line: 18, column: 9, message: "Missing null check before calling setText", severity: "error", type: "runtime", code: 'textView.setText("Total: $" + total);' },
    { id: 3, line: 24, column: 13, message: "Potential IndexOutOfBoundsException in loop", severity: "warning", type: "runtime", code: "Item item = items.get(i);" },
    { id: 4, line: 31, column: 16, message: "Method should not return null - use Optional or empty list", severity: "warning", type: "design", code: "return null;" }
  ],
  flutter: [
    { id: 1, line: 15, column: 15, message: "Missing 'Key?' for null safety compliance", severity: "error", type: "syntax", code: "MyHomePage({Key key, this.title}) : super(key: key);" },
    { id: 2, line: 21, column: 17, message: "Non-nullable field must be initialized or made nullable", severity: "error", type: "null-safety", code: "List<Item> _items;" },
    { id: 3, line: 26, column: 7, message: "Calling methods on nullable object without null check", severity: "error", type: "null-safety", code: "_items.add(Item(price: 10.0, quantity: _counter));" },
    { id: 4, line: 32, column: 21, message: "Using deprecated 'headline4' - use 'headlineMedium' instead", severity: "warning", type: "deprecation", code: "style: Theme.of(context).textTheme.headline4," }
  ]
};

export const MOCK_SOLUTIONS: Record<Platform, Record<number, Solution[]>> = {
  web: {
    1: [
      { title: "Add Null Check", description: "Add a null check before accessing object properties to prevent runtime errors.", fixedCode: "if (items[i]) {\n  total += items[i].price * items[i].quantity;\n}", confidence: 0.95 },
      { title: "Use Optional Chaining", description: "Use optional chaining operator for safer property access.", fixedCode: "total += (items[i]?.price ?? 0) * (items[i]?.quantity ?? 0);", confidence: 0.88 },
    ],
    2: [
      { title: "Add Semicolon", description: "Add a semicolon to properly terminate the statement.", fixedCode: '{ name: "Book" };', confidence: 1.0 },
    ],
    3: [
      { title: "Remove Unused Variable", description: "Remove the variable declaration since it's not being used.", fixedCode: "", confidence: 0.92 },
    ],
    4: [
      { title: "Pass Required Parameter", description: "Pass the 'cart' array as a parameter to the function call.", fixedCode: "calculateTotal(cart);", confidence: 0.98 },
    ]
  },
  android: {
    1: [
      { title: "Initialize with Empty List", description: "Return an empty list from getItems() instead of null to ensure safety.", fixedCode: "private List<Item> getItems() {\n    return new ArrayList<>(); // Return empty list instead of null\n}", confidence: 0.95 },
      { title: "Add Null Check", description: "Check if 'items' is null after calling getItems().", fixedCode: "List<Item> items = getItems();\nif (items != null) {\n    double total = calculateTotal(items);\n}", confidence: 0.88 },
    ],
    2: [
        { title: "Add Null Safety Check", description: "Check if TextView is not null before calling setText to prevent crashes.", fixedCode: "if (textView != null) {\n    textView.setText(\"Total: $\" + total);\n}", confidence: 0.92 }
    ],
    3: [
        { title: "Use Enhanced For Loop", description: "Avoid index-based loops to prevent IndexOutOfBoundsException and improve readability.", fixedCode: "for (Item item : items) {\n    total += item.price * item.quantity;\n}", confidence: 0.96 }
    ],
    4: [
        { title: "Return Empty List", description: "It's better practice to return an empty collection instead of null.", fixedCode: "private List<Item> getItems() {\n    return new ArrayList<>();\n}", confidence: 0.99 }
    ]
  },
  flutter: {
    1: [
      { title: "Update Constructor for Null Safety", description: "Use 'Key?' syntax and 'required' keyword for null safety compliance in Flutter.", fixedCode: "MyHomePage({Key? key, required this.title}) : super(key: key);", confidence: 0.98 }
    ],
    2: [
      { title: "Make Field Nullable", description: "Add '?' to make the List nullable, indicating it can be null.", fixedCode: "List<Item>? _items;", confidence: 0.95 },
      { title: "Initialize with Empty List", description: "Initialize the list with an empty list to avoid null references.", fixedCode: "List<Item> _items = [];", confidence: 0.90 }
    ],
    3: [
      { title: "Add Null-Aware Operator", description: "Use the null-aware operator '?' to safely call methods on a nullable object.", fixedCode: "_items?.add(Item(price: 10.0, quantity: _counter));", confidence: 0.92 }
    ],
    4: [
        { title: "Update to Material 3 Text Style", description: "Use the new Material 3 text theme 'headlineMedium' instead of the deprecated 'headline4'.", fixedCode: "style: Theme.of(context).textTheme.headlineMedium,", confidence: 0.99 }
    ]
  }
};

export const MOCK_TESTS: Record<Platform, string> = {
    web: `const { calculateTotal } = require('./main'); // Assuming file is main.js

describe('calculateTotal', () => {
  test('should return 0 for an empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  test('should correctly calculate the total for a valid cart', () => {
    const cart = [
      { price: 10, quantity: 2 },
      { price: 15, quantity: 1 },
      { price: 5, quantity: 5 },
    ];
    expect(calculateTotal(cart)).toBe(60);
  });

  test('should handle items with missing properties gracefully', () => {
    const cart = [
      { price: 10, quantity: 2 },
      {}, // missing properties
      { price: 5, quantity: 1 },
    ];
    // This will likely throw an error in the original code. A robust test would expect this.
    // A better implementation would handle this case.
    expect(() => calculateTotal(cart)).toThrow();
  });

  test('should handle items with zero quantity', () => {
    const cart = [
      { price: 10, quantity: 2 },
      { price: 15, quantity: 0 },
    ];
    expect(calculateTotal(cart)).toBe(20);
  });
});`,
    android: `import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;

@RunWith(MockitoJUnitRunner.class)
public class MainActivityTest {

    // Note: This tests the logic, not the Activity lifecycle directly.
    private MainActivity mainActivity;

    @Before
    public void setUp() {
        mainActivity = new MainActivity();
    }
    
    @Test
    public void calculateTotal_withValidList_returnsCorrectTotal() {
        List<MainActivity.Item> items = new ArrayList<>();
        items.add(mainActivity.new Item(10.0, 2)); // price, quantity
        items.add(mainActivity.new Item(20.5, 1));
        
        double result = mainActivity.calculateTotal(items);
        
        assertEquals(40.5, result, 0.001);
    }
    
    @Test
    public void calculateTotal_withEmptyList_returnsZero() {
        List<MainActivity.Item> items = new ArrayList<>();
        double result = mainActivity.calculateTotal(items);
        assertEquals(0.0, result, 0.001);
    }

    @Test(expected = NullPointerException.class)
    public void calculateTotal_withNullList_throwsException() {
        // The original code would throw a NullPointerException here
        mainActivity.calculateTotal(null);
    }
}`,
    flutter: `import 'package:flutter_test/flutter_test.dart';
import 'package:your_app_name/main.dart'; // Replace with your app name

void main() {
  // These are logic tests for the Item class, not widget tests for the UI.
  group('Item', () {
    test('Item should be created with price and quantity', () {
      final item = Item(price: 10.0, quantity: 2);
      expect(item.price, 10.0);
      expect(item.quantity, 2);
    });
  });

  // Example of a widget test for MyHomePage
  group('MyHomePage', () {
    testWidgets('Counter increments smoke test', (WidgetTester tester) async {
      // Build our app and trigger a frame.
      await tester.pumpWidget(MyApp());

      // Verify that our counter starts at 0.
      expect(find.text('0'), findsOneWidget);
      expect(find.text('1'), findsNothing);

      // Tap the '+' icon and trigger a frame.
      // Note: this will fail with the original code due to the null exception on _items.
      // This test highlights the bug.
      // await tester.tap(find.byIcon(Icons.add));
      // await tester.pump();

      // Verify that our counter has incremented.
      // expect(find.text('0'), findsNothing);
      // expect(find.text('1'), findsOneWidget);
    });
  });
}`
};

export const MOCK_DOCS: Record<Platform, string> = {
    web: `/**
 * Calculates the total cost of items in a shopping cart.
 * @param {Array<Object>} items - An array of items, each with price and quantity.
 * @returns {number} The total cost.
 */
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    // Check if item exists before accessing properties to prevent errors.
    if (items[i] && items[i].price && items[i].quantity) {
      total += items[i].price * items[i].quantity;
    }
  }
  return total;
}

// Defines a shopping cart with various items.
const cart = [
  { price: 10, quantity: 2 },
  { price: 15, quantity: 1 },
  // This item is missing price and quantity and will be skipped.
  { name: "Book" }
];

// This variable is not used anywhere and can be safely removed.
let unusedVar = "This variable is never used";

// Calculate total for the cart and log it.
console.log(calculateTotal(cart));
`,
    android: `package com.firefly.demo;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
import java.util.List;
import java.util.ArrayList;

/**
 * The main activity for the demo application.
 */
public class MainActivity extends Activity {
    
    /**
     * Called when the activity is first created.
     * @param savedInstanceState If the activity is being re-initialized, this Bundle contains the data it most recently supplied.
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        TextView textView = findViewById(R.id.textView);
        
        List<Item> items = getItems();
        // Ensure items list is not null before calculation.
        if (items != null) {
            double total = calculateTotal(items);
            // Ensure textView is not null before setting text.
            if (textView != null) {
               textView.setText("Total: $" + total);
            }
        }
    }
    
    /**
     * Calculates the total price of a list of items.
     * @param items The list of items to calculate.
     * @return The total price as a double.
     */
    public double calculateTotal(List<Item> items) {
        double total = 0;
        // Use an enhanced for-loop for better readability and safety.
        for (Item item : items) {
            total += item.price * item.quantity;
        }
        return total;
    }
    
    /**
     * Retrieves the list of items.
     * @return A new empty ArrayList to avoid null pointer issues.
     */
    private List<Item> getItems() {
        // Return an empty list instead of null to prevent NullPointerException.
        return new ArrayList<>();
    }
    
    /**
     * Represents a single item with price and quantity.
     */
    public class Item {
        double price;
        int quantity;
        
        /**
         * Constructor for an Item.
         * @param price The price of the item.
         * @param quantity The quantity of the item.
         */
        public Item(double price, int quantity) {
            this.price = price;
            this.quantity = quantity;
        }
    }
}`,
    flutter: `import 'package:flutter/material.dart';

void main() => runApp(MyApp());

/// The root widget of the application.
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: MyHomePage(title: 'Flutter Demo'),
    );
  }
}

/// The main screen of the application.
class MyHomePage extends StatefulWidget {
  /// The title of the home page.
  final String title;

  /// Creates a new instance of MyHomePage.
  /// A [Key] is now properly used for null safety.
  MyHomePage({Key? key, required this.title}) : super(key: key);

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;
  // The list of items is now nullable and initialized to null.
  List<Item>? _items;

  /// Increments the counter and adds a new item to the list.
  void _incrementCounter() {
    setState(() {
      _counter++;
      // Initialize the list if it's null before adding items.
      _items ??= [];
      // Safely add a new item.
      _items!.add(Item(price: 10.0, quantity: _counter));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Center(
        child: Text('You have pushed the button $_counter times'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        child: Icon(Icons.add),
      ),
    );
  }
}

/// Represents an item with a price and quantity.
class Item {
  /// The price of the item.
  /// The quantity of the item.
  final int quantity;
  
  /// Creates a new item.
  Item({required this.price, required this.quantity});
}`
};


export const MOCK_OPTIMIZED_CODE: Record<Platform, string> = {
    web: `/**
 * Calculates the total cost of items in a shopping cart using a more robust and functional approach.
 * @param {Array<Object>} items - An array of items, each potentially with price and quantity.
 * @returns {number} The total cost.
 */
function calculateTotal(items) {
  // Use Array.prototype.reduce for a more functional and concise calculation.
  // It iterates over the array and accumulates a single value.
  return items.reduce((accumulator, currentItem) => {
    // Use optional chaining (?.) and the nullish coalescing operator (??)
    // to safely access properties and provide default values if they are null or undefined.
    const price = currentItem?.price ?? 0;
    const quantity = currentItem?.quantity ?? 0;
    return accumulator + (price * quantity);
  }, 0); // Initialize the accumulator to 0.
}

const cart = [
  { price: 10, quantity: 2 },
  { price: 15, quantity: 1 },
  // This item is now handled safely by the optimized function.
  { name: "Book" }
];

// The function is now called with its required parameter.
const total = calculateTotal(cart);
console.log('Total:', total);
`,
    android: `package com.firefly.demo;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

public class MainActivity extends Activity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Use Optional to handle the potential absence of the view
        Optional.ofNullable(findViewById(R.id.textView)).ifPresent(view -> {
            TextView textView = (TextView) view;
            List<Item> items = getItems(); // getItems now returns a non-null list
            double total = calculateTotal(items);
            textView.setText("Total: $" + String.format("%.2f", total));
        });
    }
    
    /**
     * Calculates the total price of a list of items using Java Streams for a more functional style.
     * @param items The list of items to calculate. Must not be null.
     * @return The total price as a double.
     */
    public double calculateTotal(List<Item> items) {
        // Using streams is more declarative and can be safer.
        return items.stream()
                    .mapToDouble(item -> item.price * item.quantity)
                    .sum();
    }
    
    /**
     * Retrieves the list of items.
     * @return A new empty ArrayList to avoid null pointer issues.
     */
    private List<Item> getItems() {
        // Always return a list, even if it's empty. This is better than returning null.
        return new ArrayList<>();
    }
    
    public class Item {
        double price;
        int quantity;
        
        public Item(double price, int quantity) {
            this.price = price;
            this.quantity = quantity;
        }
    }
}`,
    flutter: `import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: MyHomePage(title: 'Flutter Demo'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  final String title;
  const MyHomePage({Key? key, required this.title}) : super(key: key);

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;
  // Initialize the list directly. This is safer than making it nullable.
  final List<Item> _items = [];

  void _incrementCounter() {
    setState(() {
      _counter++;
      // No null check needed as _items is guaranteed to be non-null.
      _items.add(Item(price: 10.0, quantity: _counter));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Center(
        // Use a more descriptive text widget
        child: Text(
          'Button presses: $_counter',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment', // Add a tooltip for accessibility
        child: const Icon(Icons.add),
      ),
    );
  }
}

class Item {
  final double price;
  final int quantity;
  
  const Item({required this.price, required this.quantity});
}`
};

const MOCK_FILE_SYSTEM: FileSystemNode[] = [
    {
        id: 'folder-src', name: 'src', type: 'folder', children: [
            { id: 'file-main-ts', name: 'main.ts', type: 'file', content: `console.log("Hello, World!");` }
        ]
    },
    { id: 'file-readme', name: 'README.md', type: 'file', content: '# My Project' }
];

const MOCK_WEB_FILESYSTEM: FileSystemNode[] = [
    {
        id: 'file-html', name: 'index.html', type: 'file', content: `<!DOCTYPE html>
<html>
<head>
  <title>My Web App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is a live preview.</p>
  <script src="script.js"></script>
</body>
</html>`
    },
    { id: 'file-css', name: 'style.css', type: 'file', content: `body {\n  font-family: sans-serif;\n  background-color: #f0f0f0;\n  color: #333;\n}` },
    { id: 'file-js', name: 'script.js', type: 'file', content: `console.log('Script loaded!');` }
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj_1',
        name: 'My Web App',
        createdAt: new Date('2023-10-26').toISOString(),
        code: CODE_TEMPLATES,
        health: 92,
        currentBranch: 'main',
        branches: {
            'main': MOCK_WEB_FILESYSTEM,
            'feat/new-ui': [
                ...MOCK_FILE_SYSTEM,
                { id: 'file-feat', name: 'feature.ts', type: 'file', content: '// New feature' }
            ]
        }
    },
    {
        id: 'proj_2',
        name: 'Flutter Demo',
        createdAt: new Date('2023-11-15').toISOString(),
        code: CODE_TEMPLATES,
        health: 78,
        currentBranch: 'develop',
        branches: {
            'develop': MOCK_FILE_SYSTEM
        }
    }
];

export const MOCK_PRS: PrInfo[] = [
    {
        id: '42',
        title: 'feat: Add login button and user authentication flow',
        author: 'alice.j',
        description: 'This PR introduces a new login button on the homepage and sets up the basic authentication flow using JWT.',
        files: [
            {
                path: 'src/components/Header.tsx',
                status: 'modified',
                patch: `--- a/src/components/Header.tsx
+++ b/src/components/Header.tsx
@@ -5,6 +5,7 @@
   return (
     <header>
       <h1>My App</h1>
+      <LoginButton />
     </header>
   );
 }`
            },
            {
                path: 'src/components/LoginButton.tsx',
                status: 'added',
                patch: `--- /dev/null
+++ b/src/components/LoginButton.tsx
@@ -0,0 +1,5 @@
+const LoginButton = () => {
+  return <button>Login</button>;
+};
+
+export default LoginButton;`
            }
        ]
    },
    {
        id: '39',
        title: 'fix: Correct calculation for cart total',
        author: 'bob.w',
        description: 'Fixes a bug where the cart total was not being calculated correctly when items were removed.',
        files: [
            {
                path: 'src/utils/cart.js',
                status: 'modified',
                patch: `--- a/src/utils/cart.js
+++ b/src/utils/cart.js
@@ -1,5 +1,5 @@
 function calculateTotal(items) {
-  return items.reduce((acc, item) => acc + item.price, 0);
+  return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
 }
 `
            }
        ]
    }
];

export const MOCK_USERS: User[] = [
    { id: 'usr_001', name: 'Alice Johnson', email: 'alice.j@example.com', phone: '555-0101', hashedMasterPassword: '', userCode: 'A1B2-C3D4-E5F6', tier: 'Forge Master' },
    { id: 'usr_002', name: 'Bob Williams', email: 'bob.w@example.com', phone: '555-0102', hashedMasterPassword: '', userCode: 'G7H8-I9J0-K1L2', tier: 'Architect' },
    { id: 'usr_003', name: 'Charlie Brown', email: 'charlie.b@example.com', phone: '555-0103', hashedMasterPassword: '', userCode: 'M3N4-O5P6-Q7R8', tier: 'Explorer' },
    { id: 'usr_004', name: 'Diana Prince', email: 'diana.p@example.com', phone: '555-0104', hashedMasterPassword: '', userCode: 'S9T0-U1V2-W3X4', tier: 'Architect' },
];