export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Limited Edition Sneaker Drop API',
    version: '1.0.0',
    description:
      'Real-time inventory reservation API for limited sneaker drops. REST endpoints handle users, drops, reservations, and purchases, while Socket.io broadcasts stock and purchase updates.',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  tags: [
    { name: 'System', description: 'Health and service metadata' },
    { name: 'Users', description: 'Simple username-based user creation' },
    { name: 'Drops', description: 'Drop creation, listing, and stock reservations' },
    { name: 'Reservations', description: 'Active reservation lookup and purchase flow' },
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            example: 'Out of stock',
          },
        },
      },
      HealthResponse: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            example: 'ok',
          },
        },
      },
      User: {
        type: 'object',
        required: ['id', 'username', 'createdAt'],
        properties: {
          id: {
            type: 'string',
            example: 'cmf0abcd1234xyz',
          },
          username: {
            type: 'string',
            example: 'alamin',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-06T10:00:00.000Z',
          },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['username'],
        properties: {
          username: {
            type: 'string',
            example: 'alamin',
          },
        },
      },
      Drop: {
        type: 'object',
        required: [
          'id',
          'name',
          'description',
          'price',
          'totalStock',
          'availableStock',
          'reservedStock',
          'soldStock',
          'startsAt',
          'endsAt',
          'status',
          'latestPurchasers',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: {
            type: 'string',
            example: 'cmf0drop1234xyz',
          },
          name: {
            type: 'string',
            example: 'Air Jordan 1 Retro High OG',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Limited Edition Sneaker',
          },
          price: {
            type: 'number',
            example: 250,
          },
          totalStock: {
            type: 'integer',
            example: 100,
          },
          availableStock: {
            type: 'integer',
            example: 97,
          },
          reservedStock: {
            type: 'integer',
            example: 2,
          },
          soldStock: {
            type: 'integer',
            example: 1,
          },
          startsAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-06T10:00:00.000Z',
          },
          endsAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: null,
          },
          status: {
            type: 'string',
            enum: ['UPCOMING', 'ACTIVE', 'ENDED'],
            example: 'ACTIVE',
          },
          latestPurchasers: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['alamin', 'rahim', 'karim'],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-06T09:55:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-06T10:00:30.000Z',
          },
        },
      },
      CreateDropRequest: {
        type: 'object',
        required: ['name', 'price', 'totalStock', 'startsAt'],
        properties: {
          name: {
            type: 'string',
            example: 'Air Jordan 1',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Limited Edition Sneaker',
          },
          price: {
            type: 'number',
            example: 250,
          },
          totalStock: {
            type: 'integer',
            example: 100,
          },
          startsAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-06T10:00:00.000Z',
          },
          endsAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2026-05-06T11:00:00.000Z',
          },
        },
      },
      Reservation: {
        type: 'object',
        required: ['id', 'userId', 'dropId', 'status', 'expiresAt', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            example: 'cmf0reservation1234xyz',
          },
          userId: {
            type: 'string',
            example: 'cmf0user1234xyz',
          },
          dropId: {
            type: 'string',
            example: 'cmf0drop1234xyz',
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'EXPIRED', 'PURCHASED', 'CANCELLED'],
            example: 'ACTIVE',
          },
          expiresAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-06T10:01:00.000Z',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-06T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-06T10:00:00.000Z',
          },
        },
      },
      ReserveDropRequest: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: {
            type: 'string',
            example: 'cmf0user1234xyz',
          },
        },
      },
      ReserveDropResponse: {
        type: 'object',
        required: ['reservation'],
        properties: {
          reservation: {
            $ref: '#/components/schemas/Reservation',
          },
        },
      },
      ActiveReservationsResponse: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Reservation',
        },
      },
      Purchase: {
        type: 'object',
        required: ['id', 'userId', 'dropId', 'reservationId', 'createdAt'],
        properties: {
          id: {
            type: 'string',
            example: 'cmf0purchase1234xyz',
          },
          userId: {
            type: 'string',
            example: 'cmf0user1234xyz',
          },
          dropId: {
            type: 'string',
            example: 'cmf0drop1234xyz',
          },
          reservationId: {
            type: 'string',
            example: 'cmf0reservation1234xyz',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-06T10:00:45.000Z',
          },
        },
      },
      PurchaseReservationRequest: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: {
            type: 'string',
            example: 'cmf0user1234xyz',
          },
        },
      },
      PurchaseReservationResponse: {
        type: 'object',
        required: ['purchase'],
        properties: {
          purchase: {
            $ref: '#/components/schemas/Purchase',
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Backend is running',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      post: {
        tags: ['Users'],
        summary: 'Create or return an existing user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateUserRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created or reused',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/drops': {
      get: {
        tags: ['Drops'],
        summary: 'List active and upcoming drops',
        responses: {
          '200': {
            description: 'Drop summaries',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Drop',
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Drops'],
        summary: 'Create a merch drop',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateDropRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Drop created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Drop',
                },
              },
            },
          },
          '400': {
            description: 'Validation or business rule error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/drops/{dropId}/reserve': {
      post: {
        tags: ['Drops'],
        summary: 'Reserve one unit of a drop for 60 seconds',
        parameters: [
          {
            name: 'dropId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Drop id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ReserveDropRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Reservation created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ReserveDropResponse',
                },
              },
            },
          },
          '400': {
            description: 'Drop is not active or request is invalid',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Drop or user not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Out of stock',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/reservations': {
      get: {
        tags: ['Reservations'],
        summary: 'List active reservations for a user',
        parameters: [
          {
            name: 'userId',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'User id',
          },
        ],
        responses: {
          '200': {
            description: 'Active reservations',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ActiveReservationsResponse',
                },
              },
            },
          },
          '400': {
            description: 'Missing or invalid userId',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/reservations/{reservationId}/purchase': {
      post: {
        tags: ['Reservations'],
        summary: 'Complete purchase for an active reservation',
        parameters: [
          {
            name: 'reservationId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Reservation id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PurchaseReservationRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Purchase completed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PurchaseReservationResponse',
                },
              },
            },
          },
          '400': {
            description: 'Reservation expired, invalid, or already purchased',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'User does not own reservation',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Reservation not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
