// CraftStudio LMS - Curated Course & Platform Data
// Handcrafted with realistic curriculum, deep technical content, and mentor notes.

const COURSES_DATA = [
  {
    id: "fs-mastery",
    title: "Production Full-Stack Architecture: Zero to High Scale",
    shortDescription: "Build resilient, distributed web systems using Node.js, PostgreSQL, Redis caching, and Docker microservices.",
    category: "Engineering",
    level: "Advanced",
    duration: "14h 35m",
    totalLessons: 18,
    rating: 4.94,
    reviewsCount: 382,
    instructor: {
      name: "Arjun Mehta",
      role: "Staff Infrastructure Engineer & Open Source Core Dev",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: "12+ years building high-throughput payment rails and distributed caching layers for 20M+ MAU platforms."
    },
    badge: "Bestseller",
    accentColor: "#6366f1",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80",
    enrolled: true,
    modules: [
      {
        id: "mod-1",
        title: "Module 1: Foundations of Resilient Backend Design",
        lessons: [
          {
            id: "fs-1",
            title: "1.1 Anatomy of a High-Scale Monolith to Microservices Split",
            duration: "24:15",
            type: "video",
            completed: true,
            summary: "Learn when to decompose a monolithic architecture and how to avoid the distributed monolith anti-pattern using bounded contexts and domain-driven design.",
            notes: `### Key Architecture Takeaways:\n- **Monolith First Rule:** Never split into microservices before establishing clean bounded contexts.\n- **Database Boundaries:** Each service must strictly own its datastore. Never share database tables across services.\n- **Network Fallacies:** Assume network latency is non-zero and connections will drop. Always implement circuit breakers (e.g., using Cockatiel or Opossum).`,
            codeSnippet: `// Example: Circuit Breaker implementation pattern
import { CircuitBreaker, handleAll } from 'cockatiel';

const breaker = new CircuitBreaker(handleAll, {
  halfOpenAfter: 10 * 1000,
  breaker: new ConsecutiveBreaker(5),
});

export async function fetchUserBilling(userId) {
  return await breaker.execute(() => paymentGateway.getAccount(userId));
}`,
            resources: [
              { name: "Distributed System Checklist (PDF)", size: "1.4 MB" },
              { name: "Module 1 Architecture Diagram (.excalidraw)", size: "420 KB" }
            ]
          },
          {
            id: "fs-2",
            title: "1.2 PostgreSQL Indexing, WAL Tuning, and Query Explain Analysis",
            duration: "32:40",
            type: "video",
            completed: true,
            summary: "Deep dive into B-Tree vs GIN indices, understanding sequential scans vs index scans, and reading EXPLAIN (ANALYZE, BUFFERS) like a seasoned DBA.",
            notes: `### Postgres Performance Insights:\n- Use **Index Only Scans** whenever possible by including covering columns.\n- Beware of **bloat** on high-write tables; monitor autovacuum thresholds.\n- Use **pg_stat_statements** in production to catch slow n+1 queries before users do.`,
            codeSnippet: `EXPLAIN (ANALYZE, BUFFERS)
SELECT u.id, u.email, o.total_amount
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
ORDER BY o.total_amount DESC
LIMIT 50;`,
            resources: [
              { name: "PostgreSQL Index Cheat-Sheet", size: "890 KB" }
            ]
          },
          {
            id: "fs-3",
            title: "1.3 Multi-Layer Caching with Redis: Invalidation, Thundering Herd & Dogpiling",
            duration: "28:10",
            type: "video",
            completed: false,
            summary: "Implement distributed locks, probabilistic early expiration (XFetch algorithm), and cache-aside patterns to prevent database stampedes under peak traffic.",
            notes: `### Mitigating Cache Stampede:\n1. **Stochastic Early Expiration:** Recompute cache in the background before TTL expires when requests arrive near the threshold.\n2. **Distributed Locks (Redlock):** Only 1 worker computes cache miss while others wait.\n3. **Cache Key Versioning:** Avoid mass FLUSHDB by prefixing namespace with version tag.`,
            codeSnippet: `// Probabilistic Early Expiration (XFetch algorithm)
function shouldRecompute(cachedItem, beta = 1.0) {
  const delta = cachedItem.computationTimeMs;
  const ttlRemaining = cachedItem.expiresAt - Date.now();
  // If random factor triggers recomputation before TTL expires:
  return (-beta * delta * Math.log(Math.random())) > ttlRemaining;
}`,
            resources: [
              { name: "Redis Caching Best Practices (Whitepaper)", size: "2.1 MB" },
              { name: "Redis Docker-Compose Sandbox", size: "12 KB" }
            ]
          }
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: Event Streams & Asynchronous Workflows",
        lessons: [
          {
            id: "fs-4",
            title: "2.1 Event-Driven Microservices with Apache Kafka & BullMQ",
            duration: "38:50",
            type: "video",
            completed: false,
            summary: "Decouple synchronous HTTP calls into durable, replayable message queues. Handling idempotency keys and out-of-order message delivery.",
            notes: `### Idempotency Pattern:\nAlways save incoming \`Idempotency-Key\` in a fast KV store within an atomic transaction before processing payment or email dispatches.`,
            codeSnippet: `// Consumer idempotency guard
async function processOrderJob(job) {
  const { idempotencyKey, payload } = job.data;
  const alreadyProcessed = await redis.setnx(\`idemp:\${idempotencyKey}\`, "PROCESSING");
  if (!alreadyProcessed) return { status: 'skipped_duplicate' };
  
  await executeOrderTransaction(payload);
  await redis.set(\`idemp:\${idempotencyKey}\`, "COMPLETED", "EX", 86400);
}`,
            resources: [
              { name: "Idempotency Architecture Guide", size: "1.1 MB" }
            ]
          },
          {
            id: "fs-5",
            title: "2.2 Real-time State Synchronization with WebSockets & Server-Sent Events",
            duration: "26:05",
            type: "video",
            completed: false,
            summary: "Compare SSE vs WebSockets for reactive client updates. Scaling socket instances using Redis pub/sub adapter with sticky sessions.",
            notes: `### SSE vs WebSockets rule of thumb:\n- If data flow is mostly 1-way (server to client) like stock tickers or notifications, **SSE** is simpler, auto-reconnects, and runs over HTTP/2 without extra protocol overhead.\n- If 2-way bi-directional low-latency (collaborative canvas, multiplayer chat), use **WebSockets**.`,
            codeSnippet: `// Server-Sent Events (SSE) fast endpoint
app.get('/api/stream/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  const sub = redisClient.duplicate();
  sub.subscribe('live-updates', (msg) => {
    res.write(\`data: \${msg}\\n\\n\`);
  });
});`,
            resources: [
              { name: "Live Chat Architecture Reference", size: "650 KB" }
            ]
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-fs",
      title: "Backend Architecture & Caching Knowledge Check",
      description: "Test your mastery of multi-tier caching, Postgres query optimization, and distributed idempotency.",
      passingScore: 80,
      questions: [
        {
          id: "q1",
          question: "What is the primary risk of relying on standard TTL expiration without probabilistic early recomputation (XFetch) under heavy traffic?",
          options: [
            "Memory leak in Redis server",
            "Cache Stampede (Thundering Herd) where hundreds of concurrent requests simultaneously hit the primary database",
            "Automatic truncation of database foreign keys",
            "Corrupted JSON payloads in serialized cache keys"
          ],
          correctIndex: 1,
          explanation: "When a popular key expires, all concurrent inbound requests experience a cache miss at the exact same millisecond, overloading the primary database in a thundering herd event."
        },
        {
          id: "q2",
          question: "When running EXPLAIN (ANALYZE, BUFFERS) in PostgreSQL, which indicator confirms that the query read data strictly from system memory without accessing disk blocks?",
          options: [
            "Disk Read Blocks > 1000",
            "Buffers: shared hit = N, read = 0",
            "Execution time: 0.000ms",
            "Parallel Worker count = 0"
          ],
          correctIndex: 1,
          explanation: "'shared hit' represents pages retrieved directly from the Postgres buffer cache, while 'read = 0' confirms zero disk block fetches were needed."
        },
        {
          id: "q3",
          question: "In an event-driven architecture, why should each microservice maintain its own database rather than sharing a single unified schema?",
          options: [
            "To maximize cloud hosting bills",
            "To prevent tight schema coupling, allow independent scaling, and isolate failure domains",
            "Because SQL databases cannot accept connections from more than two apps",
            "To avoid writing SQL queries"
          ],
          correctIndex: 1,
          explanation: "Shared databases create tight coupling: any schema alteration by Team A can silently break Team B's queries, and database crashes cascade across the entire company."
        },
        {
          id: "q4",
          question: "For a real-time dashboard that only pushes stock ticker updates from the server to the browser, what is the cleanest and most resilient protocol?",
          options: [
            "FTP streaming",
            "Server-Sent Events (SSE) over HTTP/2",
            "Raw TCP sockets",
            "Short Polling every 50ms"
          ],
          correctIndex: 1,
          explanation: "SSE provides automatic reconnection, native browser EventSource API support, multiplexing over HTTP/2, and does not require custom handshake protocol overhead."
        }
      ]
    }
  },
  {
    id: "design-mastery",
    title: "Design Systems & Motion UI: From Figma to Tokenized Code",
    shortDescription: "Craft living design systems, fluid micro-interactions, responsive CSS layout engines, and accessible WCAG AAA components.",
    category: "Design & UX",
    level: "Intermediate to Advanced",
    duration: "11h 20m",
    totalLessons: 14,
    rating: 4.98,
    reviewsCount: 512,
    instructor: {
      name: "Sophia Chen",
      role: "Head of Product Design @ Atelier & Author of Design Token Standards",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      bio: "Crafted design languages for Fortune 500 fintech apps. Passionate about spring physics, tactile UI, and accessible color systems."
    },
    badge: "Trending",
    accentColor: "#ec4899",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80",
    enrolled: true,
    modules: [
      {
        id: "mod-des-1",
        title: "Module 1: Design Tokens & Harmonic Color Systems",
        lessons: [
          {
            id: "des-1",
            title: "1.1 Building Perceptually Uniform Color Palettes with OKLCH",
            duration: "21:30",
            type: "video",
            completed: true,
            summary: "Why traditional HSL fails contrast ratios, and how OKLCH guarantees consistent lightness across hues for dark mode and accessibility.",
            notes: `### Why OKLCH Wins:\n- **Perceptual Uniformity:** An 80% lightness yellow and an 80% lightness blue look equally bright to the human eye in OKLCH, whereas HSL yellow looks blinded.\n- Makes automated dark/light mode surface tokens mathematically predictable.`,
            codeSnippet: `:root {
  --brand-primary: oklch(62% 0.22 260);
  --brand-surface: oklch(14% 0.02 260);
  --text-vibrant: oklch(98% 0.01 260);
  --text-muted: oklch(72% 0.04 260);
}`,
            resources: [
              { name: "OKLCH Color Formula Guide", size: "1.8 MB" }
            ]
          },
          {
            id: "des-2",
            title: "1.2 Designing Micro-Interactions: Spring Physics vs Easing Curves",
            duration: "30:15",
            type: "video",
            completed: false,
            summary: "Learn how to replicate natural inertia, bounce damping, and tactile magnetic buttons using CSS transitions and JavaScript physics hooks.",
            notes: `### Micro-Interaction Principles:\n1. **Duration Rules:** Subtle hovers should never exceed 150ms-200ms. Lengthy animations make software feel sluggish.\n2. **Damping Ratio:** Aim for slight overshoot (zeta ~ 0.75-0.85) to create lively feedback without jarring distraction.`,
            codeSnippet: `/* Handcrafted Spring Easing Curve */
.tactile-button {
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 250ms ease;
}
.tactile-button:hover {
  transform: translateY(-2px) scale(1.02);
}
.tactile-button:active {
  transform: translateY(1px) scale(0.98);
}`,
            resources: [
              { name: "Spring Physics Figma Component Library", size: "3.2 MB" }
            ]
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-des",
      title: "Design Systems & Tokenization Review",
      description: "Assess your knowledge of design tokens, contrast guidelines, and micro-interactions.",
      passingScore: 75,
      questions: [
        {
          id: "qd1",
          question: "Why is OKLCH increasingly preferred over HSL for defining accessible color systems?",
          options: [
            "It only works on Apple screens",
            "It is perceptually uniform, meaning identical lightness values across different hues retain genuine visual brightness balance",
            "It is smaller in file size",
            "It requires zero CSS syntax"
          ],
          correctIndex: 1,
          explanation: "In HSL, blue and yellow with Lightness=50% have vastly different perceived luminance (yellow looks blindingly bright, blue looks dark). OKLCH solves this perceptual distortion."
        },
        {
          id: "qd2",
          question: "What is the recommended duration threshold for interactive hover and button micro-states?",
          options: [
            "1.5 to 2.5 seconds",
            "150ms to 250ms",
            "Exactly 10 milliseconds",
            "Animations should never have a duration"
          ],
          correctIndex: 1,
          explanation: "Micro-interactions must feel instantaneous yet smooth. Anything over 300ms creates perceived lag and frustrates power users."
        }
      ]
    }
  },
  {
    id: "ai-systems",
    title: "Engineering AI Agents & Retrieval-Augmented Generation (RAG)",
    shortDescription: "Architect production RAG pipelines, semantic vector search with pgvector, function calling orchestration, and guardrails.",
    category: "AI & Data",
    level: "Intermediate",
    duration: "16h 40m",
    totalLessons: 20,
    rating: 4.96,
    reviewsCount: 429,
    instructor: {
      name: "Marcus Sterling",
      role: "Lead AI Engineer & Author of 'Autonomous Agent Architectures'",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      bio: "Specializing in high-precision semantic chunking, evaluation benchmarks, and multi-agent coordination systems."
    },
    badge: "New",
    accentColor: "#10b981",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
    enrolled: false,
    modules: [
      {
        id: "mod-ai-1",
        title: "Module 1: Vector Embeddings & Hybrid Search",
        lessons: [
          {
            id: "ai-1",
            title: "1.1 Chunking Strategies: Semantic Boundaries vs Sliding Window",
            duration: "27:45",
            type: "video",
            completed: false,
            summary: "Why naive 500-token splitting breaks context, and how sentence-window and hierarchical markdown chunking increases retriever accuracy.",
            notes: `### Context Chunking Rules:\n- Preserve code blocks in their entirety.\n- Store parent-child chunk relations: retrieve the specific paragraph, but feed the parent section to the LLM for richer synthesis context.`,
            codeSnippet: `// Hierarchical Chunking logic
function chunkMarkdown(markdownContent) {
  // Split on H2 / H3 semantic section headers
  const sections = markdownContent.split(/(?=^#{2,3}\\s)/gm);
  return sections.map(sec => ({
    header: sec.match(/^#{2,3}\\s(.+)/)?.[1] || 'Overview',
    body: sec.trim()
  }));
}`,
            resources: [
              { name: "RAG Evaluation Benchmark Matrix", size: "1.9 MB" }
            ]
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-ai",
      title: "RAG & Vector Search Assessment",
      description: "Test your understanding of hybrid retrieval, chunking nuances, and agent tools.",
      passingScore: 75,
      questions: [
        {
          id: "qa1",
          question: "What is Hybrid Search in a production RAG system?",
          options: [
            "Searching both Google and Bing simultaneously",
            "Combining dense vector semantic search (embeddings) with sparse keyword search (BM25) via Reciprocal Rank Fusion",
            "Using two different graphics cards to run inference",
            "Translating all documents into 5 languages"
          ],
          correctIndex: 1,
          explanation: "Hybrid search merges the semantic context-awareness of dense embeddings with the exact SKU/acronym precision of keyword matching (BM25)."
        }
      ]
    }
  },
  {
    id: "python-skills",
    title: "Python Skills & Silk Profiling: Production Architecture & Optimization",
    shortDescription: "Master high-performance Python 3.12+, async event loops, descriptor protocols, memory mechanics, and deep database & request bottleneck profiling with Django Silk and Py-Spy.",
    category: "Engineering",
    level: "Intermediate to Advanced",
    duration: "15h 45m",
    totalLessons: 16,
    rating: 4.97,
    reviewsCount: 438,
    instructor: {
      name: "Dr. Elena Rostova",
      role: "Principal Python Architect & CPython Contributor",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      bio: "14+ years engineering high-throughput Python backends. Specializes in asyncio internals, CPython GIL optimization, PyO3 bindings, and bottleneck diagnostics with Django Silk."
    },
    badge: "Bestseller",
    accentColor: "#38bdf8",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
    enrolled: true,
    modules: [
      {
        id: "mod-py-1",
        title: "Module 1: Advanced Python Internals & Metaprogramming",
        lessons: [
          {
            id: "py-1",
            title: "1.1 Descriptors Protocol, Metaclasses & Python 3.12 Generics",
            duration: "25:30",
            type: "video",
            completed: false,
            summary: "Explore how descriptors power modern ORMs like SQLAlchemy and Django models. Implement custom attribute validators with __set_name__ and Python 3.12 type parameter syntax.",
            notes: `### Key Python Metaprogramming Takeaways:\n- **Descriptor Protocol:** Any object defining \`__get__\`, \`__set__\`, or \`__delete__\` is a descriptor.\n- **Automatic Naming:** In Python 3.6+, \`__set_name__(self, owner, name)\` eliminates boilerplate string assignments.\n- **Python 3.12+ Generics:** Use clean type parameters without typing.TypeVar boilerplate: \`class DataStore[T]:\`.\n- **Data vs Non-Data Descriptors:** Data descriptors (defining \`__set__\`) take precedence over instance dictionaries, while non-data descriptors yield to \`__dict__\`.`,
            codeSnippet: `# Production Python Descriptor Protocol with 3.12+ Syntax
from typing import Any

class PositiveNumber:
    """Descriptor enforcing strictly positive numeric values."""
    def __set_name__(self, owner: type, name: str) -> None:
        self.private_name = f"_{name}"

    def __get__(self, instance: Any, owner: type | None = None) -> Any:
        if instance is None:
            return self
        return getattr(instance, self.private_name, 0.0)

    def __set__(self, instance: Any, value: float) -> None:
        if not isinstance(value, (int, float)) or value <= 0:
            raise ValueError(f"Attribute must be positive numeric, got: {value}")
        setattr(instance, self.private_name, float(value))

# Python 3.12+ Type Parameter Generic
class FinancialRecord[T]:
    amount = PositiveNumber()
    tax_rate = PositiveNumber()

    def __init__(self, item: T, amount: float, tax_rate: float = 0.18):
        self.item = item
        self.amount = amount
        self.tax_rate = tax_rate

    @property
    def total_liability(self) -> float:
        return self.amount * (1.0 + self.tax_rate)`,
            resources: [
              { name: "Python Descriptor Protocol Cheatsheet (PDF)", size: "1.2 MB" },
              { name: "Metaclass vs __init_subclass__ Guide (PDF)", size: "850 KB" }
            ]
          },
          {
            id: "py-2",
            title: "1.2 High-Throughput Concurrency: AsyncIO TaskGroups & uvloop",
            duration: "31:15",
            type: "video",
            completed: false,
            summary: "Harness structured concurrency with Python 3.11+ TaskGroup, ExceptionGroups, backpressure semaphores, and uvloop libuv bindings.",
            notes: `### Structured Concurrency Rules:\n- **Clean Cancellation:** \`asyncio.TaskGroup\` ensures that if any child coroutine raises an exception, sibling tasks are promptly cancelled, avoiding zombie threads.\n- **Exception Groups:** Unhandled errors are bundled into a native \`ExceptionGroup\`, caught via \`except* SpecificError:\`.\n- **Rate Limiting:** Guard downstream external APIs with \`asyncio.BoundedSemaphore\` to prevent socket pool exhaustion.`,
            codeSnippet: `import asyncio
import httpx

async def fetch_telemetry(client: httpx.AsyncClient, sensor_id: int, sem: asyncio.BoundedSemaphore) -> dict:
    async with sem:
        response = await client.get(f"https://api.internal/sensors/{sensor_id}/metrics")
        response.raise_for_status()
        return response.json()

async def poll_cluster_sensors(sensor_ids: list[int]) -> list[dict]:
    # Structured concurrency with TaskGroup
    sem = asyncio.BoundedSemaphore(10) # Max 10 concurrent requests
    results: list[dict] = []
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        async with asyncio.TaskGroup() as tg:
            tasks = [
                tg.create_task(fetch_telemetry(client, s_id, sem))
                for s_id in sensor_ids
            ]
    
    return [task.result() for task in tasks]`,
            resources: [
              { name: "AsyncIO Structured Concurrency Guide (PDF)", size: "1.5 MB" }
            ]
          },
          {
            id: "py-3",
            title: "1.3 Production Profiling & Query Diagnostics with Django Silk",
            duration: "34:20",
            type: "video",
            completed: false,
            summary: "Instrument live Python web backends with Django Silk. Intercept database queries, pinpoint N+1 ORM bottlenecks, record request execution timelines, and profile CPU hot paths with @silk_profile.",
            notes: `### Profiling with Django Silk (silk-python):\n- **Live Query Interception:** Silk transparently hooks into database cursors, capturing raw SQL, execution time in ms, and caller stack traces.\n- **Eliminating N+1 Queries:** In Django/Python ORMs, iterating foreign key attributes without \`select_related\` triggers 1 query per row. Silk highlights these queries in bright red.\n- **Code Block Profiling:** Use \`@silk_profile(name='...')\` decorator or \`with silk_profile('...'):\` context manager to benchmark critical business algorithms.\n- **Staging / Sandbox Isolation:** Never run Silk profiling with full persistence in unfiltered high-throughput production without sampling or IP whitelisting.`,
            codeSnippet: `# Production profiling and N+1 query elimination with Django Silk
from silk.profiling.profiler import silk_profile
from django.db.models import Prefetch

# Decorate critical path with Silk profiler
@silk_profile(name="Order Fulfillment Batch Pipeline")
def process_pending_orders(batch_size: int = 100):
    """
    Optimized ORM pipeline: Eliminates N+1 queries by prefetching
    relations identified as bottlenecks in the Silk inspection dashboard.
    """
    orders = (
        Order.objects.filter(status="PENDING")
        .select_related("customer", "shipping_address")
        .prefetch_related(
            Prefetch("items", queryset=OrderItem.objects.select_related("sku"))
        )[:batch_size]
    )

    with silk_profile(name="Inventory Settlement & Invoicing"):
        processed = []
        for order in orders:
            # All attributes are already loaded in memory; zero additional SQL queries!
            status = order.settle_inventory_and_charge()
            processed.append({"id": order.id, "status": status})

    return processed`,
            resources: [
              { name: "Django Silk Profiling & N+1 Elimination Blueprint (PDF)", size: "1.6 MB" },
              { name: "Py-Spy Flamegraph & Silk Docker Setup (.yml)", size: "24 KB" }
            ]
          }
        ]
      },
      {
        id: "mod-py-2",
        title: "Module 2: Memory Mechanics, GIL & Low-Latency Systems",
        lessons: [
          {
            id: "py-4",
            title: "2.1 Memory Optimization: __slots__, Weakref & Garbage Collection",
            duration: "27:50",
            type: "video",
            completed: false,
            summary: "Eliminate object __dict__ memory overhead with __slots__, profile heap allocations with tracemalloc, and manage generational GC pause times.",
            notes: `### CPython Memory Architecture:\n- **__slots__ Advantage:** Prevents per-instance \`__dict__\` creation, reducing footprint from ~152 bytes to ~48 bytes per object.\n- **Tracemalloc:** Built-in standard library tool to capture memory allocation diffs before and after heavy workloads.\n- **Cyclic References:** Objects referencing each other cannot be freed by ref-counting alone; the cyclical GC handles them in generations 0, 1, and 2.`,
            codeSnippet: `import sys
import tracemalloc

class StandardPoint:
    def __init__(self, x: float, y: float, z: float):
        self.x = x
        self.y = y
        self.z = z

class OptimizedPoint:
    __slots__ = ('x', 'y', 'z')
    def __init__(self, x: float, y: float, z: float):
        self.x = x
        self.y = y
        self.z = z

# Memory Footprint Comparison:
p_std = StandardPoint(1.0, 2.0, 3.0)
p_opt = OptimizedPoint(1.0, 2.0, 3.0)

print(f"Standard instance + dict: {sys.getsizeof(p_std) + sys.getsizeof(p_std.__dict__)} bytes")
print(f"Slotted instance: {sys.getsizeof(p_opt)} bytes (over 65% reduction)")`,
            resources: [
              { name: "CPython Memory Optimization Cheatsheet (PDF)", size: "820 KB" }
            ]
          },
          {
            id: "py-5",
            title: "2.2 Free-Threaded Python 3.13 (PEP 703) & Subinterpreters",
            duration: "29:40",
            type: "video",
            completed: false,
            summary: "Explore the experimental free-threaded (nogil) CPython build, thread scaling on multi-core processors, and subinterpreters with the concurrent.futures API.",
            notes: `### Free-Threaded Python (PEP 703):\n- Replaces the Global Interpreter Lock (GIL) with biased reference counting and mimalloc memory allocator.\n- CPU-bound multithreaded tasks now scale linearly across physical CPU cores without multiprocessing serialization overhead.\n- Subinterpreters provide isolated Python runtime state per thread.`,
            codeSnippet: `from concurrent.futures import ThreadPoolExecutor
import time
import math

def cpu_heavy_computation(n: int) -> int:
    # Under free-threaded Python 3.13 (nogil), this scales across all physical cores
    count = 0
    for i in range(2, n):
        if all(i % d != 0 for d in range(2, int(math.isqrt(i)) + 1)):
            count += 1
    return count

def run_multithreaded_benchmark(workers: int = 4):
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = [executor.submit(cpu_heavy_computation, 100_000) for _ in range(workers)]
        results = [f.result() for f in futures]
    duration = time.perf_counter() - start
    print(f"Processed in {duration:.3f}s across {workers} parallel threads")`,
            resources: [
              { name: "PEP 703 & Multi-Core Python Guide (PDF)", size: "1.1 MB" }
            ]
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-python",
      title: "Python Skills & Silk Profiling Assessment",
      description: "Test your mastery of Python descriptors, asyncio TaskGroup semantics, N+1 query elimination with Silk, and memory optimizations.",
      passingScore: 80,
      questions: [
        {
          id: "qp1",
          question: "What is the primary benefit of implementing __set_name__(self, owner, name) in a Python descriptor class?",
          options: [
            "It automatically compiles the Python code to C++",
            "It allows the descriptor to automatically know the attribute name assigned to it in the owner class without manual string passing",
            "It disables Python garbage collection on the instance",
            "It makes the class incompatible with inheritance"
          ],
          correctIndex: 1,
          explanation: "__set_name__ is invoked when the owner class is constructed, allowing the descriptor to discover and store the target attribute name cleanly without redundant parameters."
        },
        {
          id: "qp2",
          question: "Why is asyncio.TaskGroup() (introduced in Python 3.11) preferred over asyncio.gather() for production concurrency?",
          options: [
            "TaskGroup runs code on multiple GPUs simultaneously",
            "If one task fails in a TaskGroup, the remaining active tasks are cleanly cancelled and all errors are bundled into an ExceptionGroup, preventing orphaned background tasks",
            "TaskGroup does not support async/await syntax",
            "TaskGroup is 1000x faster because it bypasses Python's event loop"
          ],
          correctIndex: 1,
          explanation: "Structured concurrency guarantees that when an error occurs, child tasks are not left running as unmonitored zombies; they are systematically cancelled and all raised exceptions are preserved."
        },
        {
          id: "qp3",
          question: "When using Django Silk (django-silk) to profile backend API endpoints, what is the best strategy to resolve severe N+1 SQL bottlenecks highlighted in the Silk request timeline?",
          options: [
            "Add more CPU cores to the database server",
            "Use select_related() for single-valued ForeignKey relations and prefetch_related() for ManyToMany/reverse relations in the ORM queryset",
            "Convert all SQL tables to CSV files",
            "Disable Django middleware completely"
          ],
          correctIndex: 1,
          explanation: "select_related() performs a SQL JOIN in a single query for single-valued relationships, while prefetch_related() batches related lookups into a single IN query, eliminating repetitive per-row queries."
        },
        {
          id: "qp4",
          question: "How does defining __slots__ = ('x', 'y', 'z') optimize Python applications processing millions of lightweight objects?",
          options: [
            "It prevents instances from allocating an underlying __dict__ and __weakref__, drastically reducing memory overhead from ~150 bytes to ~48 bytes per object",
            "It encrypts the object's variables using AES-256",
            "It converts the class into a JavaScript JSON object",
            "It forces the object to run on a separate server"
          ],
          correctIndex: 0,
          explanation: "Standard Python objects allocate a dictionary (__dict__) to store attributes dynamically. __slots__ uses a fixed array of descriptor pointers, saving massive memory for high-volume objects."
        }
      ]
    }
  },
  {
    id: "java-mastery",
    title: "Java Mastery: High-Concurrency, JVM Internals & Modern Spring Boot",
    shortDescription: "Java is one of the world's most widely used programming languages. Master modern Java 21+, Project Loom Virtual Threads, JVM memory architecture, Garbage Collection tuning, and high-throughput microservices.",
    category: "Java",
    level: "Intermediate to Advanced",
    duration: "16h 45m",
    totalLessons: 18,
    rating: 4.98,
    reviewsCount: 512,
    instructor: {
      name: "Marcus Lindqvist",
      role: "Principal JVM Architect & OpenJDK Contributor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      bio: "15+ years engineering ultra-low latency Java trading systems and high-throughput JVM microservices handling 500,000+ RPS."
    },
    badge: "Bestseller",
    accentColor: "#f59e0b",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
    enrolled: true,
    modules: [
      {
        id: "mod-java-1",
        title: "Module 1: Modern Java 21+, Virtual Threads & Concurrency",
        lessons: [
          {
            id: "java-1",
            title: "1.1 Project Loom: Virtual Threads vs OS Platform Threads at Scale",
            duration: "27:40",
            type: "video",
            completed: false,
            summary: "Explore how Project Loom revolutionizes Java concurrency by uncoupling Java threads from OS threads. Benchmark millions of concurrent lightweight threads with StructuredTaskScope.",
            notes: `### Key Java Concurrency & Loom Insights:
- **Platform Threads vs Virtual Threads:** Platform threads wrap OS threads (1:1 mapping, ~1MB stack memory). Virtual threads run on carrier pools in JVM user-space (~few KB initial memory).
- **Blocking I/O Without Penalty:** Blocking calls (JDBC, REST, Sockets) in a virtual thread unmount from carrier threads, freeing CPU cores for other tasks without complex reactive syntax.
- **Structured Concurrency (JEP 453):** Use \`StructuredTaskScope\` to treat groups of concurrent subtasks as single units of work with automatic cancellation and error propagation.
- **ThreadLocal Caution:** Avoid large ThreadLocal objects with millions of virtual threads; migrate to Scoped Values (JEP 446).`,
            codeSnippet: `// Modern Java 21: High-Throughput Virtual Thread Executor & Structured Concurrency
import java.util.concurrent.*;
import java.time.Duration;

public class HighScaleOrderProcessor {
    public static void main(String[] args) throws Exception {
        // Create an executor that spawns a new Virtual Thread per task
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10_000; i++) {
                final int taskId = i;
                executor.submit(() -> processOrder(taskId));
            }
        } // Auto-waits for all virtual threads to complete
        System.out.println("All 10,000 tasks processed on Virtual Threads!");
    }

    private static String processOrder(int id) {
        try {
            // Non-blocking for carrier thread; unmounts virtual thread instantly
            Thread.sleep(Duration.ofMillis(50));
            return "Order #" + id + " processed successfully";
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return "Failed";
        }
    }
}`,
            resources: [
              { name: "Project Loom Architecture Blueprint (PDF)", size: "1.8 MB" },
              { name: "Java 21 Concurrency Benchmark Suite", size: "340 KB" }
            ]
          },
          {
            id: "java-2",
            title: "1.2 Pattern Matching, Record Patterns & Sealed Classes in Production",
            duration: "22:15",
            type: "video",
            completed: false,
            summary: "Implement robust domain modeling using algebraic data types, exhaustive switch expressions, and sealed hierarchies to eliminate NullPointerExceptions and invalid states.",
            notes: `### Java Type System & Pattern Matching:
- **Exhaustiveness Checking:** Sealed interfaces ensure the compiler verifies all possible subclasses are handled without needing a fallback default branch.
- **Record Patterns:** Deconstruct records directly in switch statements and instanceof checks for expressive, clean code.
- **Data-Oriented Programming:** Decouple data representation (immutable records) from business operations (pure functions and pattern matching).`,
            codeSnippet: `// Java 21+: Sealed Interface & Record Pattern Matching
public sealed interface PaymentMethod permits CreditCard, BankTransfer, CryptoWallet {}

public record CreditCard(String pan, String cvv, int expYear) implements PaymentMethod {}
public record BankTransfer(String iban, String swiftCode) implements PaymentMethod {}
public record CryptoWallet(String walletAddress, String chainId) implements PaymentMethod {}

public class PaymentRouter {
    public static String routePayment(PaymentMethod method, double amount) {
        return switch (method) {
            case CreditCard(var pan, var cvv, var expYear) -> 
                "Authorizing Card ending in: " + pan.substring(Math.max(0, pan.length() - 4));
            case BankTransfer(var iban, var swift) -> 
                "Initiating Wire transfer to IBAN: " + iban;
            case CryptoWallet(var addr, var chain) -> 
                "Broadcasting transaction on " + chain + " network to " + addr;
        };
    }
}`,
            resources: [
              { name: "Modern Java Data-Oriented Programming Guide", size: "1.2 MB" }
            ]
          },
          {
            id: "java-3",
            title: "1.3 JVM Internals: Memory Model, JIT C2 Compiler & ZGC Tuning",
            duration: "34:50",
            type: "video",
            completed: false,
            summary: "Deep dive into JVM memory layout (Eden, Survivor, Tenured, Metaspace), escape analysis, loop unrolling, and sub-millisecond pause times with ZGC and Shenandoah.",
            notes: `### JVM Memory & Garbage Collection Insights:
- **Generational ZGC (Java 21+):** Achieves sub-millisecond max pause times even with multi-terabyte heaps by performing concurrent mark and relocate phases.
- **JIT Compilation Tiers:** Tier 1-3 (C1 compiler) provides fast startup; Tier 4 (C2 compiler) performs aggressive inlining and escape analysis.
- **Escape Analysis:** If an object does not escape a method, the JVM scalar-replaces it on the stack, eliminating heap allocation overhead.`,
            codeSnippet: `# Production JVM Flags for Java 21 Low-Latency Services
java -XX:+UseZGC \\
     -XX:+ZGenerational \\
     -Xms16g -Xmx16g \\
     -XX:+AlwaysPreTouch \\
     -XX:+UseNUMA \\
     -XX:+UnlockDiagnosticVMOptions \\
     -XX:+DebugNonSafepoints \\
     -Xlog:gc*,gc+phases=debug:file=/var/log/java/gc.log:time,uptime,pid:filecount=5,filesize=100M \\
     -jar high-scale-api.jar`,
            resources: [
              { name: "ZGC & Shenandoah Tuning Cheatsheet", size: "750 KB" },
              { name: "JIT Profiling with async-profiler (Guide)", size: "2.3 MB" }
            ]
          }
        ]
      },
      {
        id: "mod-java-2",
        title: "Module 2: High-Performance Spring Boot 3 & Resilient Microservices",
        lessons: [
          {
            id: "java-4",
            title: "2.1 Spring Boot 3.3 Microservices with GraalVM Native Images",
            duration: "31:20",
            type: "video",
            completed: false,
            summary: "Compile Spring Boot applications ahead-of-time (AOT) to GraalVM native binaries for instant startup (<50ms) and minimal memory footprints (<40MB RSS) in Kubernetes.",
            notes: `### GraalVM Native Image Best Practices:
- **AOT Processing:** Spring Boot 3 inspects your bean graph at build time, replacing runtime reflection with ahead-of-time generated code.
- **Instant Cold Starts:** Essential for serverless functions and ultra-responsive autoscaling in Kubernetes.
- **Native Hints:** Configure @RegisterReflectionForBinding for external third-party DTOs that use reflection.`,
            codeSnippet: `// Spring Boot 3.3: Native AOT Configuration & REST Endpoint
package com.craftstudio.lms.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api/v1/orders")
public class OrderApplication {

    public static void main(String[] args) {
        // Virtual Threads enabled in application.properties:
        // spring.threads.virtual.enabled=true
        SpringApplication.run(OrderApplication.class, args);
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "runtime", "GraalVM Native Image",
            "thread", Thread.currentThread().toString()
        );
    }
}`,
            resources: [
              { name: "Spring Boot 3 Native Image Dockerfile", size: "45 KB" },
              { name: "Kubernetes Resource Limits Best Practices", size: "1.1 MB" }
            ]
          },
          {
            id: "java-5",
            title: "2.2 Distributed Transactions, Outbox Pattern & Kafka Event Sourcing",
            duration: "29:10",
            type: "video",
            completed: false,
            summary: "Implement transactional outbox patterns using Spring Data JPA, Debezium CDC, and Apache Kafka to achieve guaranteed at-least-once delivery without distributed 2PC locking.",
            notes: `### Transactional Outbox Pattern:
- **The Dual-Write Problem:** Writing to DB and publishing to Kafka in the same HTTP request risks data inconsistency if the broker fails.
- **The Outbox Solution:** Save business entity and outbox event record in the exact same relational DB ACID transaction.
- **Change Data Capture (CDC):** Debezium tails the database WAL and streams events to Kafka with zero application latency.`,
            codeSnippet: `// Transactional Outbox Pattern in Spring Boot
@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepo;
    private final OutboxEventRepository outboxRepo;
    private final ObjectMapper objectMapper;

    @Transactional
    public Account transferFunds(Long accountId, BigDecimal amount) throws Exception {
        Account acc = accountRepo.findById(accountId).orElseThrow();
        acc.debit(amount);
        accountRepo.save(acc);

        // Saved atomically in the same DB transaction
        OutboxEvent event = OutboxEvent.builder()
            .aggregateType("ACCOUNT")
            .aggregateId(accountId.toString())
            .eventType("FUNDS_DEBITED")
            .payload(objectMapper.writeValueAsString(new FundsDebitedEvent(accountId, amount)))
            .createdAt(Instant.now())
            .build();
        outboxRepo.save(event);
        return acc;
    }
}`,
            resources: [
              { name: "Transactional Outbox with Debezium Architecture", size: "1.6 MB" }
            ]
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-java",
      title: "Java Mastery & JVM Architecture Assessment",
      description: "Verify your mastery of Java 21+ features, Virtual Threads, JVM memory layout, and Spring Boot high-concurrency patterns.",
      passingScore: 80,
      questions: [
        {
          id: "qj1",
          question: "What is the primary architectural difference between Java Virtual Threads (Project Loom) and traditional Platform Threads?",
          options: [
            "Virtual Threads are managed in JVM user space and unmount during blocking I/O, allowing millions of concurrent tasks",
            "Virtual Threads can only execute mathematical operations and cannot perform network requests",
            "Virtual Threads require a 1:1 mapping with OS kernel threads and consume ~1MB stack memory each",
            "Virtual Threads run only in single-threaded mode and disable multi-core CPUs"
          ],
          correctIndex: 0,
          explanation: "Virtual threads are lightweight user-mode threads managed directly by the JVM. When a virtual thread performs a blocking I/O operation (such as reading from a socket or database), it unmounts from its carrier platform thread, freeing the underlying OS thread to execute other tasks."
        },
        {
          id: "qj2",
          question: "Which Garbage Collector in Java 21 is specifically designed for multi-gigabyte to multi-terabyte heaps with sub-millisecond maximum pause times?",
          options: [
            "Serial GC",
            "Generational ZGC (Z Garbage Collector)",
            "Parallel Old GC",
            "CMS (Concurrent Mark Sweep)"
          ],
          correctIndex: 1,
          explanation: "Generational ZGC in Java 21 performs virtually all heavy garbage collection phases concurrently with application threads, achieving sub-millisecond maximum pause times regardless of heap size."
        },
        {
          id: "qj3",
          question: "How does the Transactional Outbox Pattern resolve the dual-write consistency problem in microservices?",
          options: [
            "By writing to the database and sending an HTTP request at the same time without transactions",
            "By saving the entity state and the outbox event in the same relational database ACID transaction, then streaming via CDC or worker",
            "By disabling Kafka broker acknowledgments and hoping packets do not drop",
            "By storing all database records in Redis cache only"
          ],
          correctIndex: 1,
          explanation: "The Transactional Outbox pattern guarantees that state changes and event messages are committed together atomically within the same database transaction, eliminating the risk of ghost events or missing messages if the broker or app crashes."
        },
        {
          id: "qj4",
          question: "In modern Java (JEP 409 & JEP 440/441), what is the main advantage of combining Sealed Interfaces with Record Pattern Matching in switch expressions?",
          options: [
            "It automatically compiles Java code into JavaScript for running in browsers",
            "It guarantees compile-time exhaustiveness checking without needing a brittle fallback default branch",
            "It turns all private fields into public global variables",
            "It allows methods to be called without parameters"
          ],
          correctIndex: 1,
          explanation: "Sealed hierarchies restrict which types can implement an interface. The compiler can verify that all permitted subtypes are handled in a switch expression, providing compile-time exhaustiveness checking without requiring a default branch."
        }
      ]
    }
  }
];

// Initial Student Profile & Progress State (Saved to localStorage)
const INITIAL_STUDENT_PROFILE = {
  name: "Vijay Anand",
  title: "Aspiring Principal Engineer & Product Creator",
  email: "vijay.anand@vjinstitute.edu",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  memberSince: "October 2026",
  streakDays: 14,
  hoursLearned: 48.5,
  badges: [
    { id: "streak-14", title: "14-Day Velocity", icon: "⚡", desc: "Maintained a continuous 14-day study sprint" },
    { id: "pg-expert", title: "Query Master", icon: "💎", desc: "Completed Postgres EXPLAIN deep dive with 100% quiz score" },
    { id: "code-craftsman", title: "Clean Architecture", icon: "🏛️", desc: "Earned production monolith decomposition certification" }
  ],
  completedLessons: ["fs-1", "fs-2", "des-1"],
  personalNotes: {
    "fs-1": "Remember to write unit tests for the Circuit Breaker fallback paths before merging billing PR.",
    "fs-2": "Use index-only scans on orders table by including (user_id, created_at, total_amount)."
  },
  certificates: [
    {
      id: "CERT-FS-8924",
      courseId: "fs-mastery",
      courseName: "Production Full-Stack Architecture: Zero to High Scale",
      issueDate: "October 14, 2026",
      score: "96%",
      instructor: "Arjun Mehta",
      verificationHash: "0x8F9A...43B1"
    }
  ]
};
