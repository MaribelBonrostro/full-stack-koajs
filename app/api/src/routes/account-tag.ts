// eslint-disable-next-line node/no-extraneous-import
import compose from 'koa-compose';

import {
  authenticationMiddlewareFactory,
  authorizationMiddlewareFactory,
  Router,
  schemaMiddlewareFactory,
} from '@nokkel/api';

import {
  createMyAccountTagMiddleware,
  getAllTagsByAccountMiddleware,
  getTagByAccountIdAndTagIdMiddleware,
  updateAccountTagByIdMiddleware,
  AssignTagToUserMiddleware,
} from '../middlewares';

const ACCOUNT_TAG_SCHEMA = {
  name: { type: 'string', minLength: 1, maxLength: 255 },
};

const USER_ACCOUNT_TAG_SCHEMA = {
  tagId: { type: 'string', format: 'uuid' },
  accountId: { type: 'string', format: 'uuid' },
};

const USER_ACCOUNT_SCHEMA = {
  accountId: { type: 'string', format: 'uuid' },
  userId: { type: 'string', format: 'uuid' },
};

/**
 * @openapi
 * /accounts/{accountId}/tags:
 *   post:
 *     tags:
 *       - AccountTag
 *     summary: Create an account tag
 *     description: Adds a tag to the specified account.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: vip
 *     responses:
 *       201:
 *         description: Account tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountTag'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not have access to this account
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     tags:
 *       - AccountTag
 *     summary: Get all account tags
 *     description: Returns all tags for the specified account.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the account
 *     responses:
 *       200:
 *         description: List of account tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AccountTag'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not have access to this account
 *       500:
 *         description: Internal server error
 * /accounts/{accountId}/tags/{tagId}:
 *   get:
 *     tags:
 *       - AccountTag
 *     summary: Get a specific account tag
 *     description: Returns a single tag for the specified account.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the account
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the tag
 *     responses:
 *       200:
 *         description: Account tag found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountTag'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not have access to this account
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     tags:
 *       - AccountTag
 *     summary: Update an account tag
 *     description: Updates the name of a tag for the specified account.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the account
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: vvip
 *     responses:
 *       200:
 *         description: Account tag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountTag'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not have access to this account
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Internal server error
 * /accounts/{accountId}/users/{userId}/tags:
 *   post:
 *     tags:
 *       - UserAccountTag
 *     summary: Assign tag to user
 *     description: Assign an existing tag to a user in the specified account.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagId
 *             properties:
 *               tagId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Tag assigned to user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                 tag_id:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or tag not found
 *       409:
 *         description: Tag already assigned to user
 *       500:
 *         description: Internal server error
 */
export function accountTagsRouteFactory(config: { publicKey: string }) {
  const router = new Router();
  router.post(
    'createTagByAccount',
    '/accounts/:accountId/tags',
    compose([
      authenticationMiddlewareFactory(config),
      authorizationMiddlewareFactory({ permission: { required: 'WRITE' } }),
      schemaMiddlewareFactory({
        opts: { coerceTypes: false },
        schema: {
          body: {
            type: 'object',
            properties: ACCOUNT_TAG_SCHEMA,
            required: ['name'],
          },
        },
      }),
      createMyAccountTagMiddleware,
    ])
  );
  router.get(
    'getTagsByAccount',
    '/accounts/:accountId/tags',
    compose([
      authenticationMiddlewareFactory(config),
      authorizationMiddlewareFactory({ permission: { required: 'READ' } }),
      getAllTagsByAccountMiddleware,
    ])
  );
  router.get(
    'getTagsByAccountId',
    '/accounts/:accountId/tags/:tagId',
    compose([
      authenticationMiddlewareFactory(config),
      authorizationMiddlewareFactory({ permission: { required: 'READ' } }),
      schemaMiddlewareFactory({
        opts: { coerceTypes: false },
        schema: {
          params: {
            type: 'object',
            properties: USER_ACCOUNT_TAG_SCHEMA,
            required: ['accountId', 'tagId'],
          },
        },
      }),
      getTagByAccountIdAndTagIdMiddleware,
    ])
  );
  router.patch(
    'updateTagByAccount',
    '/accounts/:accountId/tags/:tagId',
    compose([
      authenticationMiddlewareFactory(config),
      authorizationMiddlewareFactory({ permission: { required: 'WRITE' } }),
      schemaMiddlewareFactory({
        opts: { coerceTypes: false },
        schema: {
          body: {
            type: 'object',
            properties: USER_ACCOUNT_TAG_SCHEMA,
            required: ['name'],
          },
        },
      }),
      updateAccountTagByIdMiddleware,
    ])
  );
  router.post(
    'AssignTagToUser',
    '/accounts/:accountId/users/:userId/tags',
    compose([
      authenticationMiddlewareFactory(config),
      authorizationMiddlewareFactory({ permission: { required: 'WRITE' } }),
      schemaMiddlewareFactory({
        opts: { coerceTypes: false },
        schema: {
          params: {
            type: 'object',
            properties: USER_ACCOUNT_SCHEMA,
            required: ['accountId', 'userId'],
          },
          body: {
            type: 'object',
            properties: {
              tagId: { type: 'string', format: 'uuid' },
            },
            required: ['tagId'],
          },
        },
      }),
      AssignTagToUserMiddleware,
    ])
  );

  return router;
}
