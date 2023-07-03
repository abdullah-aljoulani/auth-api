"use strict"

require('dotenv').config();
const base64 = require('base-64')
const bcrypt = require('bcrypt')
const {server} = require('../src/ server');
const supertest = require('supertest');
const req = supertest(server);
const { db } = require('../src/models/index');

beforeAll(async () => {
    await db.sync();
  })

afterAll(async () => {

    await db.drop();
  })

  describe('testing the server', () => {

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkphbGFsIiwiaWF0IjoxNjg4MzgyOTc4fQ.rfibuDjkkADiKqe9anp34K1zj8u3MwzspPcblau_Rys"

    it('POST to /signup to create a new user.', async () => {
      const res = await req.post('/signup').send({
          username: 'abdullah',
          password: '1234',
          role: 'admin'
        }); 


        expect(res.status).toBe(201);
        expect(res.body.user.username).toEqual('abdullah')
        expect( await bcrypt.compare('1234',res.body.user.password)).toEqual(true)
  });
  it('POST to /signin to login as a user (use basic auth). & Need tests for auth middleware and the routes.', async () => {
    const res = await req
      .post('/signin')
      .set('Authorization', `Basic ${await base64.encode('abdullah:1234')}` )


    expect(res.status).toBe(200); 
    expect(res.request._header.authorization).toBe('Basic SmFsYWw6MTIzNA==');

  });

  it('should successfully access an authenticated route', async () => {
    const res = await req
      .get('/secret')
      .set('Authorization', `Bearer ${token}`);

    // Assert the expected behavior based on the authentication status
    expect(res.status).toBe(200);
    // ...
  });

  it('should fail to access an authenticated route without a token', async () => {
    const res = await req
      .get('/secret');

    // Assert the expected behavior based on the authentication status
    expect(res.status).toBe(500);
    // ...
  });


  // testing with model V1

  it('404 on a bad route', async () => {
    const res = await req.get('/pageNotFound')
    expect(res.status).toBe(404);
  });

  it('404 on a bad method', async () => {
    const res = await req.post('/api/v1/clothes/1')
    expect(res.status).toBe(404);
  });
  it('Create a record using POST', async () => {
      const res = await req.post('/api/v1/clothes').send({
          name: 'T-SHIRT',
          color: 'Black',
          size: 'XLL'
        });
        const createdGame = JSON.parse(res.text);
        expect(res.status).toBe(201);
        expect(res.body.name).toEqual('T-SHIRT')
        expect(res.body.color).toEqual('Black')
  });


  it('Read a list of records using GET', async () => {
    const res = await req.get('/api/v1/clothes');
    console.log(res.body)
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  })

  it('Read a record using GET', async () => {
    const res = await req.get('/api/v1/clothes/1');
    console.log(res.body)
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('T-SHIRT');
  })
  it('Update a record using PUT', async () => {
    const res = await req.put('/api/v1/clothes/1').send({
          name: 'Pants',
          color: 'Black',
          size: 'L'
    });
    console.log(res.body)
    expect(res.status).toBe(202)
    expect(res.body.name).toBe('Pants');
  })

  it('Destroy a record using DELETE', async () => {
    const res = await req.delete('/api/v1/clothes/1');
    expect(res.status).toBe(200);
    expect(res.body).toBe(1);
  })
  // testing with model V2

  it('404 on a bad route', async () => {
    const res = await req.get('/pagenotFound')
    expect(res.status).toBe(404);
  });

  it('404 on a bad method', async () => {
    const res = await req.post('/api/v2/clothes/1')
    expect(res.status).toBe(404);
  });
  it('Create a record using POST without Auth', async () => {
      const res = await req.post('/api/v2/clothes').send({
          name: 'T-SHIRT',
          color: 'Black',
          size: 'XLL'
        });

        expect(res.status).toBe(500);
        expect(res.body.message).toEqual("Invalid Login")

  });
  it('Create a record using POST WITH Auth', async () => {
      const res = await req.post('/api/v2/clothes').send({
          name: 'T-SHIRT',
          color: 'Black',
          size: 'XLL'
        }).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(201);
        expect(res.body.name).toEqual("T-SHIRT")

  });


  it('Read a list of records using GET without Auth', async () => {
    const res = await req.get('/api/v2/clothes');
    console.log(res.body)
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Invalid Login");
  })
  it('Read a list of records using GET with Auth', async () => {
    const res = await req.get('/api/v2/clothes').set('Authorization', `Bearer ${token}`);
    console.log(res.body)
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  })

  it('Read a record using GET without Auth', async () => {
    const res = await req.get('/api/v2/clothes/2');
    console.log(res.body)
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Invalid Login');
  })
  it('Read a record using GET with Auth', async () => {
    const res = await req.get('/api/v2/clothes/2').set('Authorization', `Bearer ${token}`);
    console.log(res.body)
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('T-SHIRT');
  })
  it('Update a record using PUT without Auth', async () => {
    const res = await req.put('/api/v2/clothes/2').send({
        name: 'Pants',
        color: 'Black',
        size: 'L'
    });
    console.log(res.body)
    expect(res.status).toBe(500)
    expect(res.body.message).toBe('Invalid Login');
    })
    it('Update a record using PUT with Auth', async () => {
    const res = await req.put('/api/v2/clothes/2').send({
        name: 'Pants',
        color: 'Black',
        size: 'L'
    }).set('Authorization', `Bearer ${token}`);
    console.log(res.body)
    expect(res.status).toBe(202)
    expect(res.body.name).toBe('Pants');
    })

    it('Destroy a record using DELETE without Auth', async () => {
    const res = await req.delete('/api/v2/clothes/2');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Invalid Login");
    })
    it('Destroy a record using DELETE with Auth', async () => {
    const res = await req.delete('/api/v2/clothes/2').set('Authorization', `Bearer ${token}`);;
    expect(res.status).toBe(200);
    expect(res.body).toBe(1);

    })
    })