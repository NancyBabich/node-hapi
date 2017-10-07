'use strict';

let products = [];
let cart = [];

if (window.products) {
  products = window.products;
  render(products);
} else {
  fetchProducts();
}

// fetch cart
get('/public/server/db.json')
  .then(c => {
    cart = c.map(x => x.id);
    render(products, cart);
  })
  .catch(err => console.error('Unable to fetch products.', err));

$('.products__search').addEventListener('input', ev => {
  const { value } = ev.target;
  if (!value) {
    render(products);
  } else {
    render(
      products.filter(
        p => (p.name + p.description).toLowerCase().indexOf(value) > -1
      )
    );
  }
});

$('.products__form').addEventListener('submit', ev => {
  ev.preventDefault();
  const { target } = ev;

  const find = (id, map = x => x) =>
    map(target.querySelector(`input[name=${id}]`).value);

  const id = find('id', parseInt);
  const name = find('name');
  const description = find('description');
  const price = find('price', parseFloat) * 100;
  const token = find('token');

  post(
    '/api/products',
    { id, name, description, price },
    {
      Authorization: `Bearer ${token}`
    }
  ).then(res => {
    if (res.status === 201) {
      [].forEach.call(target.querySelectorAll('input'), i => {
        i.value = '';
      });
      fetchProducts();
    } else {
      console.error(res);
      window.alert('Unable to add the product.');
    }
  });
});

function get(url) {
  return window.fetch(url).then(res => res.json());
}

function delet(url) {
  return window.fetch(url, {
    method: 'DELETE'
  });
}

function post(url, data, headers = {}) {
  return window.fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: JSON.stringify(data, null, 2)
  });
}

function fetchProducts() {
  get('./public/server/db.json')
    .then(p => {
      products = p;
      render(p, cart);
    })
    .catch(err => console.error('Unable to fetch products.', err));
}

function render(products, cart) {
  const $products = document.querySelector('.products');
  $products.innerHTML = '';

  for (const product of products) {
    $products.appendChild(renderProduct(product, cart));
  }
}

function renderProduct({ name, id, price, description }, cart) {
  const $img = el('img.product__img');
  $img.width = 250;
  $img.height = 250;
  $img.alt = name;
  $img.src = `https://xpla.org/ext/lorempixel/250/250/technics/${id}/`;

  const $name = el('h3.product__name');
  $name.textContent = name;

  const $price = el('p.product__price');
  $price.innerHTML = `Price: <strong>$${(price / 100).toFixed(2)}</strong>`;

  const $description = el('p.product__description');
  const $descriptionText = el('span');
  const $descriptionExpand = el('a');
  [$descriptionText, $descriptionExpand].forEach(el =>
    $description.appendChild(el)
  );

  const renderDescription = full => {
    $descriptionText.textContent = full
      ? `${description} `
      : `${description.substr(0, 10)}... `;
    $descriptionExpand.textContent = full ? 'Less' : 'Read more';
  };
  let expanded = false;
  $descriptionExpand.addEventListener('click', () => {
    expanded = !expanded;
    renderDescription(expanded);
  });
  renderDescription(expanded);

  const $button = el('button.product__button');
  if (cart.indexOf(id) > -1) {
    $button.innerHTML = `
      <svg width="25" height="25">
        <g><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-12h-12v12zm13-15h-3.5l-1-1h-5l-1 1h-3.5v2h14v-2z"></path></g>
      </svg>
      Remove from cart
    `;
    $button.addEventListener('click', () => {
      const idx = cart.indexOf(id);
      if (idx === -1) {
        return;
      }
      cart.splice(idx, 1);
      render(products, cart);
      delet(`/api/cart/${id}`).catch(err => {
        console.error(err);
        window.alert('Unable to remove product from cart.');
      });
    });
  } else {
    $button.innerHTML = `
      <svg width="25" height="25">
        <g><path d="M11 9h2v-3h3v-2h-3v-3h-2v3h-3v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01-1.74-.96h-.01l-1.1 2-2.76 5h-7.02l-.13-.27-2.24-4.73-.95-2-.94-2h-3.27v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2h-11.58c-.13 0-.25-.11-.25-.25z"></path></g>
      </svg>
      Buy
    `;
    $button.addEventListener('click', () => {
      post('/api/products', { id }).then(res => {
        if (res.status === 201) {
          cart.push(id);
          render(products, cart);
        } else {
          console.error(res);
          window.alert('Unable to add product to cart.');
        }
      });
    });
  }

  const $product = el('.product');
  [$img, $name, $price, $description, $button].forEach($el =>
    $product.appendChild($el)
  );

  return $product;
}

function $(selector) {
  return document.querySelector(selector);
}

function el(creator) {
  const classes = creator.split('.');
  const tag = classes.shift() || 'div';

  const $el = document.createElement(tag);
  classes.forEach(clazz => $el.classList.add(clazz));
  return $el;
}
