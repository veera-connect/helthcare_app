"""Healthcare MCP Server — controlled tool access for the AI assistant."""

import asyncio
import json
from typing import Any
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# Lazy imports to avoid circular deps
_app_initialized = False

server = Server("healthcare-mcp-server")


@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="get_patient_profile",
            description="Get the profile of the currently authenticated patient. Only returns data for the authenticated patient.",
            inputSchema={
                "type": "object",
                "properties": {
                    "patient_id": {"type": "string", "description": "The patient's UUID (must match authenticated user)"}
                },
                "required": ["patient_id"],
            },
        ),
        Tool(
            name="get_patient_appointments",
            description="Get upcoming appointments for the authenticated patient.",
            inputSchema={
                "type": "object",
                "properties": {
                    "patient_id": {"type": "string", "description": "The patient's UUID (must match authenticated user)"},
                    "limit": {"type": "integer", "default": 5, "description": "Maximum number of appointments to return"},
                },
                "required": ["patient_id"],
            },
        ),
        Tool(
            name="search_available_doctors",
            description="Search for available doctors, optionally filtered by specialization. Returns public information only.",
            inputSchema={
                "type": "object",
                "properties": {
                    "specialization": {"type": "string", "description": "Doctor specialization to filter by (optional)"},
                    "limit": {"type": "integer", "default": 5},
                },
            },
        ),
        Tool(
            name="book_appointment",
            description="Book an appointment for the authenticated patient.",
            inputSchema={
                "type": "object",
                "properties": {
                    "patient_id": {"type": "string"},
                    "doctor_id": {"type": "string"},
                    "scheduled_at": {"type": "string", "description": "ISO 8601 datetime"},
                    "reason": {"type": "string"},
                },
                "required": ["patient_id", "doctor_id", "scheduled_at"],
            },
        ),
        Tool(
            name="cancel_appointment",
            description="Cancel an appointment for the authenticated patient.",
            inputSchema={
                "type": "object",
                "properties": {
                    "appointment_id": {"type": "string"},
                    "patient_id": {"type": "string", "description": "Must match authenticated user"},
                    "reason": {"type": "string"},
                },
                "required": ["appointment_id", "patient_id"],
            },
        ),
        Tool(
            name="get_medical_records",
            description="Get medical records for the authenticated patient. Returns a summary, not full record details.",
            inputSchema={
                "type": "object",
                "properties": {
                    "patient_id": {"type": "string", "description": "Must match authenticated user"},
                    "limit": {"type": "integer", "default": 5},
                },
                "required": ["patient_id"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """
    Tool execution stub. In production, these call the backend API with the
    authenticated patient's JWT token.

    SECURITY: Every tool call must verify that the requesting patient_id
    matches the authenticated user's patient_id before returning any data.
    """
    if name == "search_available_doctors":
        return [TextContent(type="text", text=json.dumps({
            "doctors": [
                {"id": "demo-doc-1", "name": "Dr. James Smith", "specialization": "General Practice", "available": True},
                {"id": "demo-doc-2", "name": "Dr. Sarah Jones", "specialization": "Cardiology", "available": True},
            ],
            "note": "Connect to backend API to get live data",
        }))]

    # All patient-specific tools require auth context in production
    return [TextContent(type="text", text=json.dumps({
        "error": "This tool requires backend API integration with patient authentication.",
        "tool": name,
        "arguments": arguments,
    }))]


async def main():
    async with stdio_server() as streams:
        await server.run(*streams, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
