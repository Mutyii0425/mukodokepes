import express from 'express';
import mysql from 'mysql';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'webshoppp',
  password: 'Premo900',
  database: 'webshoppp'
});

db.connect((err) => {
  if (err) {
    console.log('Hiba az adatbázis kapcsolódásnál:', err);
    return;
  }
  console.log('MySQL adatbázis kapcsolódva');
});

// Kategóriák lekérése
app.get('/categories', (req, res) => {
  const query = 'SELECT * FROM kategoriak';
  db.query(query, (err, results) => {
    if (err) {
      console.log('Hiba a kategóriák lekérésénél:', err);
      res.status(500).json({ error: 'Adatbázis hiba' });
      return;
    }
    res.json(results);
  });
});

app.get('/products', (req, res) => {
  const query = 'SELECT * FROM usertermekek';
  db.query(query, (err, results) => {
    console.log('Lekért adatok:', results); // Ellenőrzéshez
    res.json(results);
  });
});

app.get('/termekekk', (req, res) => {
  const query = 'SELECT * FROM termekek';
  db.query(query, (err, results) => {
    console.log('Lekért adatok:', results); // Ellenőrzéshez
    res.json(results);
  });
});


// Új termék mentése
app.post('/usertermekek', (req, res) => {
  const { kategoriaId, ar, nev, leiras, meret, imageUrl, images } = req.body;
  
  const query = `
    INSERT INTO usertermekek 
    (kategoriaId, ar, nev, leiras, meret, imageUrl, images) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [kategoriaId, ar, nev, leiras, meret, imageUrl, JSON.stringify(images)], (err, result) => {
    if (err) {
      console.log('SQL error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, id: result.insertId });
  });
});
app.delete('/products/:id', (req, res) => {
  const productId = req.params.id;
  
  const query = 'DELETE FROM usertermekek WHERE id = ?';
  
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.log('Hiba a termék törlésénél:', err);
      res.status(500).json({ error: 'Hiba a törlés során' });
      return;
    }
    res.json({ message: 'Termék sikeresen törölve' });
  });
});

app.get('/products/:id', (req, res) => {
  console.log('Requested product ID:', req.params.id);
  const query = 'SELECT * FROM usertermekek WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    console.log('Query results:', results);
    if (err) {
      console.log('Database error:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(results[0]);
  });
});


app.post('/vevo/create', (req, res) => {
  const { nev, telefonszam, email, irsz, telepules, kozterulet } = req.body;
  
  const query = `
    INSERT INTO vevo 
    (nev, telefonszam, email, irsz, telepules, kozterulet) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [nev, telefonszam, email, irsz, telepules, kozterulet], (err, result) => {
    if (err) {
      console.log('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      success: true,
      id: result.insertId 
    });
  });
});

app.post('/orders/create', (req, res) => {
  const { termek, statusz, mennyiseg, vevo_id } = req.body;
  
  const query = `
    INSERT INTO rendeles 
    (termek, statusz, mennyiseg, vevo_id) 
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(query, [termek, statusz, mennyiseg, vevo_id], (err, result) => {
    if (err) {
      console.log('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      success: true,
      orderId: result.insertId
    });
  });
});
app.get('/termekek/:id', (req, res) => {
  console.log('Kért termék ID:', req.params.id); // Ellenőrzéshez hozzáadjuk
  const query = 'SELECT * FROM termekek WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.log('Adatbázis hiba:', err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }
    console.log('Találat:', results); // Ellenőrzéshez hozzáadjuk
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Termék nem található' });
    }
    return res.json(results[0]);
  });
});

app.post('/termekek/create', (req, res) => {
  const { nev, ar, termekleiras, kategoria, imageUrl, kategoriaId } = req.body;
  
  const query = `
    INSERT INTO termekek 
    (nev, ar, termekleiras, kategoria, imageUrl, kategoriaId) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [nev, ar, termekleiras, kategoria, imageUrl, kategoriaId], (err, result) => {
    if (err) {
      console.log('SQL error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      success: true,
      id: result.insertId,
      message: 'Termék sikeresen létrehozva' 
    });
  });
});



app.get('/termekek', (req, res) => {
  const query = 'SELECT * FROM termekek';
  db.query(query, (err, results) => {
    if (err) {
      console.log('Hiba a termékek lekérésénél:', err);
      res.status(500).json({ error: 'Adatbázis hiba' });
      return;
    }
    console.log('Lekért termékek:', results);
    res.json(results);
  });
});

app.put('/termekek/:id', (req, res) => {
  const { id } = req.params;
  const { ar, termekleiras } = req.body;
  
  const query = 'UPDATE termekek SET ar = ?, termekleiras = ? WHERE id = ?';
  
  db.query(query, [ar, termekleiras, id], (err, result) => {
    if (err) {
      console.log('Hiba a termék frissítésénél:', err);
      res.status(500).json({ error: 'Hiba a frissítés során' });
      return;
    }
    res.json({ message: 'Termék sikeresen frissítve' });
  });
});

app.delete('/termekek/:id', (req, res) => {
  const productId = req.params.id;
  
  const query = 'DELETE FROM termekek WHERE id = ?';
  
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.log('Hiba a termék törlésénél:', err);
      res.status(500).json({ error: 'Hiba a törlés során' });
      return;
    }
    res.json({ message: 'Termék sikeresen törölve' });
  });
});

app.get('/users', (req, res) => {
  const query = 'SELECT * FROM user';
  db.query(query, (err, results) => {
    if (err) {
      console.log('Hiba a felhasználók lekérésénél:', err);
      res.status(500).json({ error: 'Adatbázis hiba' });
      return;
    }
    res.json(results);
  });
});

// Felhasználó törlése
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'DELETE FROM user WHERE f_azonosito = ?';

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.log('Hiba a felhasználó törlésénél:', err);
      res.status(500).json({ error: 'Hiba a törlés során' });
      return;
    }
    res.json({ message: 'Felhasználó sikeresen törölve' });
  });
});
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  console.log("Fetching user data for ID:", userId);

  const query = 'SELECT felhasznalonev, email FROM user WHERE f_azonosito = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.log('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log("Query results:", results);
    if (results && results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

app.post('/save-rating', (req, res) => {
  console.log('Beérkezett adatok:', req.body); // Ellenőrzéshez
  
  const { rating, email, velemeny } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  db.query('SELECT f_azonosito FROM user WHERE email = ?', [email], (err, userResult) => {
    if (err) {
      console.log('User lekérés hiba:', err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }

    const userId = userResult[0].f_azonosito;
    console.log('User ID:', userId); // Ellenőrzéshez

    db.query(
      'INSERT INTO ratings (f_azonosito, rating, velemeny, date) VALUES (?, ?, ?, ?)',
      [userId, rating, velemeny, currentDate],
      (err, result) => {
        if (err) {
          console.log('Mentési hiba:', err);
          return res.status(500).json({ error: 'Mentési hiba' });
        }
        res.json({ success: true });
      }
    );
  });
});

app.get('/get-all-ratings', (req, res) => {
  const query = `
    SELECT r.rating_id, r.rating, r.date, r.velemeny, u.felhasznalonev 
    FROM ratings r 
    JOIN user u ON r.f_azonosito = u.f_azonosito 
    ORDER BY r.date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Adatbázis hiba:', err);
      res.status(500).json({ error: 'Adatbázis hiba' });
      return;
    }
    res.json(results);
  });
});

// DELETE rating
app.delete('/delete-rating/:id', (req, res) => {
  const ratingId = req.params.id;
  
  db.query('DELETE FROM ratings WHERE rating_id = ?', [ratingId], (err, result) => {
    if (err) {
      console.error('Törlési hiba:', err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }
    res.json({ success: true });
  });
});

app.put('/update-rating/:id', (req, res) => {
  const { rating, velemeny } = req.body;
  const ratingId = req.params.id;
  
  const query = 'UPDATE ratings SET rating = ?, velemeny = ? WHERE rating_id = ?';
  db.query(query, [rating, velemeny, ratingId], (err, result) => {
    if (err) {
      console.log('Update error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

app.post('/add-rating', (req, res) => {
  const { felhasznalonev, rating, velemeny } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Get user ID first
  db.query('SELECT f_azonosito FROM user WHERE felhasznalonev = ?', [felhasznalonev], (err, users) => {
    if (err) {
      console.log('User query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Insert rating with user ID
    const userId = users[0].f_azonosito;
    db.query(
      'INSERT INTO ratings (f_azonosito, rating, velemeny, date) VALUES (?, ?, ?, ?)',
      [userId, rating, velemeny, currentDate],
      (err, result) => {
        if (err) {
          console.log('Insert error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
      }
    );
  });
});

app.get('/check-user/:username', (req, res) => {
  const username = req.params.username;
  db.query('SELECT email FROM user WHERE felhasznalonev = ?', [username], (err, results) => {
    if (err || results.length === 0) {
      res.json({ exists: false });
    } else {
      res.json({ exists: true, email: results[0].email });
    }
  });
});













const port = 5000;
app.listen(port, () => {
  console.log(`Server fut a ${port} porton`);
});



