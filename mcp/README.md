# Healthcare MCP Server

An MCP (Model Context Protocol) server that provides the AI Healthcare Assistant with controlled, authenticated access to healthcare data.

## Tools

| Tool | Description | Auth Required |
|---|---|---|
| `get_patient_profile` | Get authenticated patient's profile | Yes — own profile only |
| `get_patient_appointments` | List patient's appointments | Yes — own appointments only |
| `search_available_doctors` | Search public doctor listings | No |
| `book_appointment` | Book an appointment | Yes — own bookings only |
| `cancel_appointment` | Cancel an appointment | Yes — own appointments only |
| `get_medical_records` | Get patient's record summaries | Yes — own records only |

## Security Model

- Every tool call includes the authenticated patient's JWT token
- The backend API validates the token and checks that the requested resource belongs to that patient
- The AI assistant cannot call admin tools or access other patients' data
- Tool outputs are treated as untrusted data by the AI — never as instructions

## Running

```bash
pip install -r requirements.txt
python src/server.py
```

## Integration with Claude Code

Add to `.claude/settings.json`:
```json
{
  "mcpServers": {
    "healthcare": {
      "command": "python",
      "args": ["mcp/healthcare-mcp-server/src/server.py"],
      "env": {
        "BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}
```
