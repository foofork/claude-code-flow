# 🌊 Claude-Flow (Stable Fork): Advanced AI Agent Orchestration Platform

<div align="center">

[![🌟 Star on GitHub](https://img.shields.io/github/stars/foofork/claude-code-flow?style=for-the-badge&logo=github&color=gold)](https://github.com/foofork/claude-code-flow)
[![⚡ Claude Code](https://img.shields.io/badge/Claude%20Code-Ready-green?style=for-the-badge&logo=anthropic)](https://github.com/foofork/claude-code-flow)
[![🦕 Multi-Runtime](https://img.shields.io/badge/Runtime-Node%20%7C%20Deno-blue?style=for-the-badge&logo=javascript)](https://github.com/foofork/claude-code-flow)
[![⚡ TypeScript](https://img.shields.io/badge/TypeScript-100%25%20Clean-brightgreen?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![🛡️ MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=opensourceinitiative)](https://opensource.org/licenses/MIT)

</div>

---

## ✨ **STABLE FORK NOTICE**

> **🚀 Production-Ready Fork with Major Improvements**
> 
> This is a stable fork of claude-code-flow with significant enhancements:
> 
> - **✅ TypeScript**: Fixed typescript and compilation errors - builds cleanly
> - **✅ Stability**: Production-ready with all core features intact
> 
> **Original**: [ruvnet/claude-code-flow](https://github.com/ruvnet/claude-code-flow) (v1.0.72 on npm)
> **This Fork**: Cleaner, more stable, TypeScript-compliant version

---

## 🎯 **Transform Your Development Workflow**

**Claude-Flow** is the ultimate orchestration platform that revolutionizes how you work with Claude Code. Coordinate **multiple AI agents** simultaneously, manage complex workflows, and build sophisticated applications with AI-powered development.

> 🔥 **One command to rule them all**: `npx claude-flow@latest init --sparc` - Deploy a full AI agent coordination system in seconds!


## 🚀 **What's Improved in This Fork**

### 🎯 **Core Improvements**
- **✅ TypeScript Compilation**: Zero errors, full type safety
- **✅ Clean Dependencies**: Removed node-pty and other problematic packages
- **✅ Reduced Codebase**: 17,000+ lines of experimental code removed
- **✅ Better Build Process**: Cleaner, more reliable builds across platforms
- **✅ Production Ready**: Stable, tested, and ready for real projects

### 🔧 **All Original Features Intact**
- **✅ Terminal Pool**: Efficient terminal session management
- **✅ Web UI Console**: Full web interface with `--ui` flag
- **✅ SPARC Modes**: All 17 development modes working perfectly
- **✅ Memory System**: Persistent knowledge sharing across agents
- **✅ MCP Integration**: Model Context Protocol support

### 🚀 **Developer Experience**
- **✅ Zero TypeScript Errors**: Clean compilation every time
- **✅ Cross-Platform**: Works on macOS, Linux, and Windows
- **✅ Cleaner Codebase**: Easier to understand and extend
- **✅ Better Performance**: Less overhead from removed experiments

---

## ⚡ **Quick Start** 

### 🚀 **Instant Setup**
```bash
# Option 1: Install from this stable fork (recommended)
npm install -g github:foofork/claude-code-flow
claude-flow init --sparc

# Option 2: Use original npm version (has TypeScript errors)
npx claude-flow@latest init --sparc

# Use the local wrapper (created by init)
./claude-flow start --ui --port 3000

# Run SPARC commands
./claude-flow sparc "build a REST API"
```

### 🎛️ **SPARC Development Modes** (17 Specialized Agents)
```bash
# List all available SPARC modes
./claude-flow sparc modes

# Run specific development workflows
./claude-flow sparc run coder "implement user authentication"
./claude-flow sparc run architect "design microservice architecture"
./claude-flow sparc tdd "create test suite for API"
```

## 🏗️ **Core Features**

### 🤖 **Multi-Agent Orchestration**
- **Parallel Execution**: Run up to 10 agents concurrently with BatchTool
- **Smart Coordination**: Intelligent task distribution and load balancing
- **Memory Sharing**: Persistent knowledge bank across all agents
- **Real-time Monitoring**: Live dashboard for agent status and progress

### 🧠 **SPARC Development Framework**
- **17 Specialized Modes**: Architect, Coder, TDD, Security, DevOps, and more
- **Workflow Orchestration**: Complete development lifecycle automation
- **Interactive & Non-interactive**: Flexible execution modes
- **Boomerang Pattern**: Iterative development with continuous refinement

### 📊 **Advanced Monitoring & Analytics**
- **System Health Dashboard**: Real-time metrics and performance tracking
- **Task Coordination**: Dependency management and conflict resolution
- **Terminal Pool Management**: Efficient resource utilization
- **Coverage Reports**: Comprehensive test and code coverage analysis

---

## 🛠️ **Installation & Setup**

### **Method 1: Install from Stable Fork (Recommended)**
```bash
# Install globally from this fork
npm install -g github:foofork/claude-code-flow

# Initialize with full SPARC environment
claude-flow init --sparc

# This creates:
# ✓ Local ./claude-flow wrapper script
# ✓ .claude/ directory with configuration
# ✓ CLAUDE.md (project instructions for Claude Code)
# ✓ .roomodes (17 pre-configured SPARC modes)
# ✓ Swarm command documentation

# Start using immediately
./claude-flow start --ui --port 3000
```

### **Method 2: Original NPM Version**
```bash
# Install globally from npm (has TypeScript errors)
npm install -g claude-flow

# Initialize anywhere
claude-flow init --sparc

# Use directly
claude-flow start --ui
```

### **Method 3: Local Project Installation**
```bash
# Add to project
npm install claude-flow --save-dev

# Initialize
npx claude-flow init --sparc

# Use with local wrapper
./claude-flow start --ui
```

---

## 🎮 **Usage Examples**

### 🚀 **Basic Operations**
```bash
# Check system status
./claude-flow status

# Start orchestration with Web UI
./claude-flow start --ui --port 3000

# Check MCP server status
./claude-flow mcp status

# Manage agents
./claude-flow agent spawn researcher --name "DataBot"
./claude-flow agent info agent-123
./claude-flow agent terminate agent-123
```

### 🔥 **Advanced Workflows**

#### **Multi-Agent Development**
```bash
# Deploy swarm for full-stack development
./claude-flow swarm "Build e-commerce platform" \
  --strategy development \
  --max-agents 5 \
  --parallel \
  --monitor

# BatchTool parallel development
batchtool run --parallel \
  "./claude-flow sparc run architect 'design user auth'" \
  "./claude-flow sparc run code 'implement login API'" \
  "./claude-flow sparc run tdd 'create auth tests'" \
  "./claude-flow sparc run security-review 'audit auth flow'"
```

#### **SPARC Development Modes**
```bash
# Complete development workflow
./claude-flow sparc run ask "research best practices for microservices"
./claude-flow sparc run architect "design scalable architecture"
./claude-flow sparc run code "implement user service"
./claude-flow sparc run tdd "create comprehensive test suite"
./claude-flow sparc run integration "integrate all services"
./claude-flow sparc run devops "setup CI/CD pipeline"
```

#### **Memory & Coordination**
```bash
# Store and query project knowledge
./claude-flow memory store requirements "User auth with JWT"
./claude-flow memory store architecture "Microservice design patterns"
./claude-flow memory query auth

# Task coordination
./claude-flow task create research "Market analysis for AI tools"
./claude-flow task workflow examples/development-pipeline.json
```

---

## 📋 **Available Commands**

### **Core Commands**
| Command | Description | Example |
|---------|-------------|---------|
| `init` | Initialize project with Claude integration | `./claude-flow init --sparc` |
| `start` | Start orchestration system | `./claude-flow start --ui` |
| `status` | Show system health and metrics | `./claude-flow status` |
| `agent` | Manage AI agents and hierarchies | `./claude-flow agent spawn researcher` |
| `swarm` | Advanced multi-agent coordination | `./claude-flow swarm "Build API" --parallel` |

### **SPARC Development Modes**
| Mode | Purpose | Example |
|------|---------|---------|
| `architect` | System design and architecture | `./claude-flow sparc run architect "design API"` |
| `code` | Code development and implementation | `./claude-flow sparc run code "user authentication"` |
| `tdd` | Test-driven development | `./claude-flow sparc run tdd "payment system"` |
| `security-review` | Security auditing and analysis | `./claude-flow sparc run security-review "auth flow"` |
| `integration` | System integration and testing | `./claude-flow sparc run integration "microservices"` |
| `devops` | Deployment and CI/CD | `./claude-flow sparc run devops "k8s deployment"` |

### **Memory & Coordination**
| Command | Description | Example |
|---------|-------------|---------|
| `memory store` | Store information in knowledge bank | `./claude-flow memory store key "value"` |
| `memory query` | Search stored information | `./claude-flow memory query "authentication"` |
| `task create` | Create and manage tasks | `./claude-flow task create research "AI trends"` |
| `monitor` | Real-time system monitoring | `./claude-flow monitor --dashboard` |

### **Enterprise Commands**
| Command | Description | Example |
|---------|-------------|---------|
| `project` | Project lifecycle management | `./claude-flow project create "API Project" --type web-app` |
| `deploy` | Deployment automation & strategies | `./claude-flow deploy create "v1.2.0" --strategy blue-green` |
| `cloud` | Multi-cloud infrastructure management | `./claude-flow cloud resources create "web-server" compute` |
| `security` | Security scanning & compliance | `./claude-flow security scan "Vulnerability Check" ./src` |
| `analytics` | Performance analytics & insights | `./claude-flow analytics insights --timerange 7d` |
| `audit` | Enterprise audit logging | `./claude-flow audit report compliance --framework SOC2` |

---

## 🏗️ **Architecture Overview**

### **Multi-Layer Agent System**
```
┌─────────────────────────────────────────────────────────┐
│                 BatchTool Orchestrator                  │
├─────────────────────────────────────────────────────────┤
│  Agent 1    Agent 2    Agent 3    Agent 4    Agent 5   │
│ Architect │   Coder   │   TDD    │ Security │  DevOps   │
├─────────────────────────────────────────────────────────┤
│              Shared Memory Bank & Coordination          │
├─────────────────────────────────────────────────────────┤
│         Terminal Pool & Resource Management             │
├─────────────────────────────────────────────────────────┤
│              Claude Code Integration Layer              │
└─────────────────────────────────────────────────────────┘
```

### **Key Components**
- **🎛️ Orchestrator**: Central coordination and task distribution
- **🤖 Agent Pool**: Specialized AI agents for different domains
- **🧠 Memory Bank**: Persistent knowledge sharing across agents
- **📊 Monitor**: Real-time metrics and health monitoring
- **🔗 MCP Server**: Model Context Protocol for tool integration

---

## 🧪 **Testing & Quality Assurance**

### **Comprehensive Test Coverage**
```bash
# Run full test suite
npm test

# Run specific test categories
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests

# Generate coverage reports
npm run test:coverage

# Lint and typecheck
npm run lint
npm run typecheck
```

### **Quality Metrics (v1.0.72)**
- **✅ Project-Focused**: CLAUDE.md explicitly guides building user applications
- **✅ Clear Instructions**: No confusion about modifying claude-flow itself
- **✅ Real Examples**: All documentation shows building actual applications
- **✅ NPM Publishing**: Fully compatible with npx and global installation
- **✅ Cross-Platform**: Windows, Mac, and Linux support

---

## 📚 **Documentation & Resources**

### **Getting Started**
- [🚀 Quick Start Guide](./docs/quick-start.md)
- [⚙️ Configuration Options](./docs/configuration.md)
- [🤖 Agent Management](./docs/agents.md)
- [🧠 SPARC Development](./docs/sparc-modes.md)

### **Advanced Topics**
- [🔧 BatchTool Integration](./docs/batchtool.md)
- [📊 Monitoring & Analytics](./docs/monitoring.md)
- [🔗 MCP Server Setup](./docs/mcp-integration.md)
- [🔒 Security Best Practices](./docs/security.md)

### **API Reference**
- [📖 Command Reference](./docs/commands.md)
- [🎛️ Configuration Schema](./docs/config-schema.md)
- [🔌 Plugin Development](./docs/plugins.md)
- [🛠️ Troubleshooting](./docs/troubleshooting.md)

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

### **Development Setup**
```bash
# Clone the repository
git clone https://github.com/ruvnet/claude-code-flow.git
cd claude-code-flow

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Link for local development
npm link
```

### **Contributing Guidelines**
- 🐛 **Bug Reports**: Use GitHub issues with detailed reproduction steps
- 💡 **Feature Requests**: Propose new features with use cases
- 🔧 **Pull Requests**: Follow our coding standards and include tests
- 📚 **Documentation**: Help improve docs and examples

---

## 📄 **License**

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🎉 **Acknowledgments**

- **Anthropic**: For the amazing Claude AI that powers this platform
- **Node.js Team**: For the excellent JavaScript runtime
- **Open Source Community**: For contributions and feedback
- **SPARC Methodology**: For the structured development approach

---

<div align="center">

### **🚀 Ready to transform your development workflow?**

```bash
# Install the stable fork
npm install -g github:foofork/claude-code-flow
claude-flow init --sparc
```

**Experience Claude-Flow with zero TypeScript errors and better stability!**

[![GitHub](https://img.shields.io/badge/GitHub-foofork/claude--code--flow-blue?style=for-the-badge&logo=github)](https://github.com/foofork/claude-code-flow)
[![Original](https://img.shields.io/badge/Original-ruvnet/claude--code--flow-gray?style=for-the-badge&logo=github)](https://github.com/ruvnet/claude-code-flow)

---

**Stable Fork by [foofork](https://github.com/foofork) | Original by [rUv](https://github.com/ruvnet) | Powered by Claude AI**

</div>
