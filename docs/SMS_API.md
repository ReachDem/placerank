# SMS API Documentation

This API endpoint allows you to send SMS messages using the mboasms service.

## Endpoint

**POST** `/api/sendSMS`

## Configuration

Before using the SMS API, you need to configure the following environment variables:

1. Copy `.env.example` to `.env.local`
2. Update the values:
   - `MBOA_SMS_API_KEY`: Your mboasms API key
   - `MBOA_SMS_API_URL`: The mboasms API URL (default: https://api.mboasms.com)

## Request Format

### Required Fields
- `to`: string | string[] - Phone number(s) in international format (+1234567890)
- `message`: string - SMS content (1-1600 characters)

### Optional Fields
- `from`: string - Sender ID (if supported by provider)

### Example Request

```json
{
  "to": "+1234567890",
  "message": "Hello from PlaceRank!",
  "from": "PlaceRank"
}
```

### Multiple Recipients

```json
{
  "to": ["+1234567890", "+0987654321"],
  "message": "Bulk SMS message",
  "from": "PlaceRank"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "SMS sent successfully",
  "data": {
    "messageId": "msg_123456",
    "status": "sent",
    "recipients": 1,
    "cost": 0.05
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## HTTP Status Codes

- `200`: Success
- `400`: Bad Request (validation errors)
- `500`: Internal Server Error

## Examples

### Using curl

```bash
curl -X POST http://localhost:3000/api/sendSMS \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Hello from PlaceRank!",
    "from": "PlaceRank"
  }'
```

### Using JavaScript/fetch

```javascript
const response = await fetch('/api/sendSMS', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: '+1234567890',
    message: 'Hello from PlaceRank!',
    from: 'PlaceRank'
  })
});

const result = await response.json();
console.log(result);
```

## Phone Number Format

Phone numbers must be in international format:
- Start with `+`
- Followed by country code
- No spaces or special characters
- Example: `+1234567890`, `+33123456789`

## Message Limits

- Minimum: 1 character
- Maximum: 1600 characters (allows for up to 10 concatenated SMS)
- Standard SMS limit is 160 characters for a single message

## Error Handling

Common error scenarios:

1. **Invalid phone number**: Returns 400 with validation message
2. **Missing required fields**: Returns 400 with field validation
3. **API configuration missing**: Returns 500 with configuration error
4. **SMS service failure**: Returns 500 with service error

## Integration with mboasms

This API integrates with the mboasms SMS service. Make sure you have:

1. A valid mboasms account
2. Sufficient credit balance
3. Proper API key configuration
4. Network access to mboasms API endpoints