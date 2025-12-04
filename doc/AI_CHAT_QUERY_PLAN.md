# 🤖 AI Chat Query Feature - Implementation Plan

## 📋 Overview

Fitur chat AI yang memungkinkan user melakukan query ke database asset menggunakan natural language. Sistem akan menggunakan **Google Gemini 2.0 Flash** untuk menginterpretasi pertanyaan user dan menghasilkan SQL query yang aman, kemudian mengembalikan hasil dalam format yang mudah dipahami.

## 🎯 Goals

1. User dapat bertanya dalam bahasa natural (Indonesia/English)
2. AI menginterpretasi pertanyaan dan generate SQL query
3. Query dijalankan dengan aman (read-only, parameterized)
4. Hasil ditampilkan dalam format yang user-friendly
5. Mendukung context/history conversation

## 🗄️ Database Schema Reference

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  categories │     │  locations  │     │    users    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ name        │     │ name        │     │ name        │
│ description │     │ building    │     │ email       │
└──────┬──────┘     │ floor       │     │ role        │
       │            │ description │     └──────┬──────┘
       │            └──────┬──────┘            │
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────┐
│                        assets                         │
├──────────────────────────────────────────────────────┤
│ id, asset_code, name, category_id, location_id       │
│ brand, model, serial_number, specifications          │
│ purchase_date, purchase_price, warranty_expiry       │
│ status (available/assigned/repair/retired/missing)   │
│ notes, image_url, created_at, updated_at             │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                    transactions                       │
├──────────────────────────────────────────────────────┤
│ id, asset_id, user_id, type, previous_status         │
│ new_status, previous_location_id, new_location_id    │
│ notes, transaction_date, created_at                  │
└──────────────────────────────────────────────────────┘
```

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ChatInterface Component                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ ChatWindow  │  │ MessageList │  │ InputArea   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼ POST /api/chat/query
┌────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  ChatController                      │   │
│  │  • Validate & sanitize input                        │   │
│  │  • Rate limiting                                     │   │
│  │  • Authentication check                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   AIQueryService                     │   │
│  │  • Build prompt with schema context                 │   │
│  │  • Call Gemini 2.0 Flash API                        │   │
│  │  • Parse & validate generated SQL                   │   │
│  │  • Execute safe query                               │   │
│  │  • Format response                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│              ┌───────────────┼───────────────┐              │
│              ▼               ▼               ▼              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │ Gemini API    │  │ SQL Validator │  │   Database    │   │
│  │ (generate SQL)│  │ (security)    │  │ (read-only)   │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
backend/
├── config/
│   └── gemini.js                 # Gemini API configuration
├── controllers/
│   └── ChatController.js         # Chat endpoint handler
├── services/
│   └── AIQueryService.js         # AI query logic & SQL generation
├── middleware/
│   └── rateLimiter.js            # Rate limiting for AI endpoints
├── utils/
│   ├── sqlValidator.js           # SQL injection prevention
│   └── schemaContext.js          # Database schema for AI context
└── routes/
    └── ChatRoutes.js             # /api/chat routes

frontend/
├── src/
│   ├── api/
│   │   └── chatAPI.js            # Chat API calls
│   ├── components/
│   │   └── chat/
│   │       ├── ChatInterface.jsx # Main chat container
│   │       ├── ChatWindow.jsx    # Chat message display
│   │       ├── MessageBubble.jsx # Individual message
│   │       ├── InputArea.jsx     # Text input & send button
│   │       ├── QueryResult.jsx   # Display query results (table/chart)
│   │       └── SuggestionChips.jsx # Quick query suggestions
│   └── pages/
│       └── ChatPage.jsx          # Chat page wrapper
```

## 🔒 Security Measures

### 1. SQL Injection Prevention
```javascript
// sqlValidator.js
const BLOCKED_KEYWORDS = [
  'DROP', 'DELETE', 'TRUNCATE', 'UPDATE', 'INSERT',
  'ALTER', 'CREATE', 'GRANT', 'REVOKE', 'EXEC',
  '--', ';--', '/*', '*/', 'xp_', 'sp_'
];

const validateSQL = (sql) => {
  const upperSQL = sql.toUpperCase();
  
  // Only allow SELECT statements
  if (!upperSQL.trim().startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }
  
  // Block dangerous keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    if (upperSQL.includes(keyword)) {
      throw new Error(`Blocked keyword detected: ${keyword}`);
    }
  }
  
  return true;
};
```

### 2. Read-Only Database Connection
```javascript
// Separate read-only connection for AI queries
const readOnlyConnection = new Sequelize({
  ...config,
  dialectOptions: {
    ...config.dialectOptions,
    // MySQL read-only mode
    flags: ['FOUND_ROWS']
  }
});
```

### 3. Query Timeout & Row Limits
```javascript
const executeQuery = async (sql) => {
  return await db.query(sql, {
    type: QueryTypes.SELECT,
    timeout: 5000,      // 5 second timeout
    raw: true,
    nest: true,
    limit: 100          // Max 100 rows
  });
};
```

### 4. Rate Limiting
```javascript
// 10 requests per minute per user
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests, please try again later'
});
```

## 🤖 Gemini Prompt Engineering

### System Prompt
```
You are a SQL query generator for an IT Asset Management System.
Your task is to convert natural language questions into safe, read-only SQL queries.

DATABASE SCHEMA:
[Include full schema here]

RULES:
1. ONLY generate SELECT statements
2. NEVER use DELETE, UPDATE, INSERT, DROP, or any DDL
3. Always use table aliases for clarity
4. Include JOINs when needed to get complete information
5. Use LIMIT to prevent large result sets (max 100)
6. Format dates appropriately for MySQL
7. Use Indonesian column names in results when appropriate

OUTPUT FORMAT:
Return ONLY the SQL query, no explanation. If the question cannot be 
answered with a query, respond with: "CANNOT_QUERY: [reason]"
```

### Example Conversations
| User Question | Generated SQL |
|--------------|---------------|
| "Berapa total asset yang tersedia?" | `SELECT COUNT(*) as total FROM assets WHERE status = 'available'` |
| "Tampilkan laptop yang garansinya expired" | `SELECT a.*, c.name as category FROM assets a JOIN categories c ON a.category_id = c.id WHERE c.name LIKE '%laptop%' AND a.warranty_expiry < CURDATE()` |
| "Asset mana yang paling sering dipinjam?" | `SELECT a.name, COUNT(t.id) as loan_count FROM assets a JOIN transactions t ON a.id = t.asset_id WHERE t.type = 'checkout' GROUP BY a.id ORDER BY loan_count DESC LIMIT 10` |
| "Siapa yang terakhir meminjam printer?" | `SELECT u.name, t.transaction_date FROM transactions t JOIN users u ON t.user_id = u.id JOIN assets a ON t.asset_id = a.id WHERE a.name LIKE '%printer%' AND t.type = 'checkout' ORDER BY t.transaction_date DESC LIMIT 1` |

## 📝 Implementation Steps

### Phase 1: Backend Foundation (Day 1)
- [ ] Install dependencies: `@google/generative-ai`, `express-rate-limit`
- [ ] Create Gemini configuration
- [ ] Create schema context utility
- [ ] Create SQL validator utility
- [ ] Create AIQueryService
- [ ] Create ChatController
- [ ] Create ChatRoutes
- [ ] Add routes to main router
- [ ] Add environment variables for Gemini API key

### Phase 2: Frontend Chat UI (Day 2)
- [ ] Create chatAPI.js
- [ ] Create ChatInterface component
- [ ] Create ChatWindow component
- [ ] Create MessageBubble component
- [ ] Create InputArea component
- [ ] Create QueryResult component (table display)
- [ ] Create SuggestionChips component
- [ ] Create ChatPage
- [ ] Add route to router
- [ ] Add navigation link

### Phase 3: Enhancement (Day 3)
- [ ] Add conversation history/context
- [ ] Add chart visualization for numeric results
- [ ] Add export results to CSV/PDF
- [ ] Add saved queries feature
- [ ] Add query explanation mode
- [ ] Improve error handling & user feedback

### Phase 4: Testing & Documentation (Day 4)
- [ ] Write unit tests for SQL validator
- [ ] Write integration tests for chat endpoint
- [ ] Test various query scenarios
- [ ] Performance testing
- [ ] Update API documentation
- [ ] Update user guide

## 🔧 Environment Variables

```env
# .env additions
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
CHAT_RATE_LIMIT=10
CHAT_RATE_WINDOW_MS=60000
MAX_QUERY_ROWS=100
QUERY_TIMEOUT_MS=5000
```

## 📊 Example Query Results Display

### Table View (Default)
```
┌──────────────────────────────────────────────────────┐
│ 🤖 Query: "Tampilkan semua laptop yang tersedia"     │
├──────────────────────────────────────────────────────┤
│ ┌────────────┬──────────────┬──────────┬──────────┐ │
│ │ Asset Code │ Name         │ Brand    │ Location │ │
│ ├────────────┼──────────────┼──────────┼──────────┤ │
│ │ AST-001    │ Laptop Dell  │ Dell     │ Ruang IT │ │
│ │ AST-002    │ Laptop HP    │ HP       │ Gudang   │ │
│ │ AST-003    │ Laptop Lenovo│ Lenovo   │ Ruang IT │ │
│ └────────────┴──────────────┴──────────┴──────────┘ │
│                                                      │
│ 📊 3 results found                                   │
└──────────────────────────────────────────────────────┘
```

### Stats View (for aggregations)
```
┌──────────────────────────────────────────────────────┐
│ 🤖 Query: "Berapa total nilai asset per kategori?"  │
├──────────────────────────────────────────────────────┤
│                                                      │
│   Laptop:     Rp 450.000.000  ████████████ 45%      │
│   Monitor:    Rp 200.000.000  █████░░░░░░░ 20%      │
│   Printer:    Rp 150.000.000  ████░░░░░░░░ 15%      │
│   Network:    Rp 120.000.000  ███░░░░░░░░░ 12%      │
│   Other:      Rp  80.000.000  ██░░░░░░░░░░  8%      │
│                                                      │
│ 📊 Total: Rp 1.000.000.000                          │
└──────────────────────────────────────────────────────┘
```

## 🎨 UI/UX Design

### Chat Interface Layout
```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Asset Query Assistant                              [−][×]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 Berapa asset yang statusnya available?           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🤖 Berdasarkan data, terdapat 45 asset dengan       │   │
│  │    status available.                                 │   │
│  │                                                      │   │
│  │    ┌──────────────────────────────────────────┐     │   │
│  │    │ Status      │ Jumlah                     │     │   │
│  │    ├─────────────┼────────────────────────────┤     │   │
│  │    │ Available   │ 45                         │     │   │
│  │    └─────────────┴────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💡 Suggested queries:                                │   │
│  │ [Total asset per kategori] [Asset warranty expired] │   │
│  │ [Transaksi bulan ini] [Asset di lokasi X]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐ [Send]  │
│  │ Tanyakan sesuatu tentang asset...             │   ➤    │
│  └───────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## ⚠️ Limitations & Considerations

1. **Query Complexity**: Very complex queries might not be generated accurately
2. **Data Privacy**: Ensure AI doesn't expose sensitive data in responses
3. **Cost**: Gemini API usage has associated costs - implement caching
4. **Latency**: AI response + query execution adds latency
5. **Accuracy**: AI might generate incorrect queries - validate results

## 📈 Success Metrics

1. **Query Success Rate**: % of queries that execute successfully
2. **Response Time**: Average time from question to answer
3. **User Satisfaction**: Feedback rating on responses
4. **Usage Frequency**: How often users use the feature
5. **Error Rate**: % of queries that fail or return incorrect results

## 🚀 Future Enhancements

1. **Voice Input**: Allow voice questions
2. **Multi-language**: Support more languages
3. **Query Caching**: Cache common queries
4. **Learning**: Improve from user feedback
5. **Charts**: Auto-generate visualizations
6. **Alerts**: Set up alerts based on query conditions
7. **Scheduled Reports**: Run queries on schedule

---

## ✅ Ready to Implement?

Plan ini sudah lengkap. Ketika Anda siap untuk memulai coding, saya akan:

1. Mulai dengan Phase 1 (Backend Foundation)
2. Membuat semua file yang diperlukan
3. Test setiap komponen
4. Lanjut ke Phase 2 (Frontend)

Apakah plan ini sudah sesuai dengan kebutuhan Anda? Ada yang ingin ditambahkan atau diubah?
