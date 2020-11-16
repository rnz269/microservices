import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

const id = new mongoose.Types.ObjectId().toHexString();

it('has a route handler listening to /api/tickets/:id for PUT requests', async () => {
  const response = await request(app).put(`/api/tickets/${id}`).send({});
  expect(response.status).not.toEqual(404);
});

it('return 401 if user is not signed in', async () => {
  await request(app).put(`/api/tickets/${id}`).send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns a 404 if the ticket is not found', async () => {
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'calculator',
      price: 20,
    })
    .expect(404);
});

it('returns a 400 if signed-in user sends invalid title', async () => {
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(400);
});

it('returns 401 if user does not own ticket & is trying to change ticket', async () => {
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'abcd',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'calculator',
      price: 20,
    })
    .expect(401);
});

it('updates a ticket when provided with valid inputs', async () => {
  const cookie = global.signin(); // save ref to ensure ticket owner making request
  // create the ticket
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'abcd',
      price: 20,
    })
    .expect(201);

  // update data to:
  const title = 'calculator';
  const price = 100;

  // perform update
  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie)
    .send({
      title,
      price,
    })
    .expect(200);

  // retrieve from database and compare with title, price
  const response = await request(app)
    .get(`/api/tickets/${ticket.body.id}`)
    .send();
  expect(response.body.title).toEqual(title);
  expect(response.body.price).toEqual(price);
});
