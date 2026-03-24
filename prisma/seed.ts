import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({ url: 'file:dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpar banco
  await prisma.review.deleteMany()
  await prisma.orderStatusHistory.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menuCategory.deleteMany()
  await prisma.restaurant.deleteMany()
  await prisma.user.deleteMany()

  // Usuários
  const hash = (p: string) => bcrypt.hashSync(p, 10)

  const joao = await prisma.user.create({ data: { name: 'João Silva', email: 'joao@lumefood.com', password: hash('senha123'), role: 'CUSTOMER', phone: '11999990001' } })
  const maria = await prisma.user.create({ data: { name: 'Maria Souza', email: 'maria@lumefood.com', password: hash('senha123'), role: 'CUSTOMER', phone: '11999990002' } })
  const pedro = await prisma.user.create({ data: { name: 'Pedro Costa', email: 'pedro@lumefood.com', password: hash('senha123'), role: 'CUSTOMER', phone: '11999990003' } })
  const adminPizzaria = await prisma.user.create({ data: { name: 'Admin Pizzaria', email: 'admin.pizzaria@lumefood.com', password: hash('admin123'), role: 'RESTAURANT_ADMIN' } })
  const adminBurguer = await prisma.user.create({ data: { name: 'Admin BurgerHouse', email: 'admin.burguer@lumefood.com', password: hash('admin123'), role: 'RESTAURANT_ADMIN' } })
  const adminPizzaExpress = await prisma.user.create({ data: { name: 'Admin Pizza Express', email: 'admin.pizzaexpress@lumefood.com', password: hash('admin123'), role: 'RESTAURANT_ADMIN' } })
  const adminSushi = await prisma.user.create({ data: { name: 'Admin Sushi Zen', email: 'admin.sushi@lumefood.com', password: hash('admin123'), role: 'RESTAURANT_ADMIN' } })
  const adminFrango = await prisma.user.create({ data: { name: 'Admin FrangoGrill', email: 'admin.frango@lumefood.com', password: hash('admin123'), role: 'RESTAURANT_ADMIN' } })
  const adminSalad = await prisma.user.create({ data: { name: 'Admin Salad & Go', email: 'admin.salad@lumefood.com', password: hash('admin123'), role: 'RESTAURANT_ADMIN' } })

  // Carts para os customers
  await prisma.cart.create({ data: { userId: joao.id } })
  await prisma.cart.create({ data: { userId: maria.id } })
  await prisma.cart.create({ data: { userId: pedro.id } })

  // Restaurantes
  const bellaNapoli = await prisma.restaurant.create({
    data: {
      ownerId: adminPizzaria.id, name: 'Bella Napoli Pizza', description: 'As melhores pizzas artesanais de São Paulo, com massa fresca e ingredientes importados da Itália.',
      category: 'Pizza', address: 'Av. Paulista, 1200 - Bela Vista, São Paulo', phone: '11 3333-0001',
      isOpen: true, minimumOrder: 25.0, deliveryFee: 5.99, deliveryTime: 40, rating: 4.5, reviewCount: 234,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'
    }
  })

  const pizzaExpress = await prisma.restaurant.create({
    data: {
      ownerId: adminPizzaExpress.id, name: 'Pizza Express', description: 'Pizza rápida e saborosa. Fechado temporariamente para reforma.',
      category: 'Pizza', address: 'Rua Augusta, 500 - Consolação, São Paulo', phone: '11 3333-0002',
      isOpen: false, minimumOrder: 20.0, deliveryFee: 4.99, deliveryTime: 35, rating: 4.1, reviewCount: 89,
      imageUrl: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400'
    }
  })

  const burgerHouse = await prisma.restaurant.create({
    data: {
      ownerId: adminBurguer.id, name: 'BurgerHouse', description: 'Hambúrgueres artesanais com blend especial de carne, servidos com batatas crocantes.',
      category: 'Burger', address: 'Rua Oscar Freire, 700 - Jardins, São Paulo', phone: '11 3333-0003',
      isOpen: true, minimumOrder: 25.0, deliveryFee: 6.99, deliveryTime: 35, rating: 4.8, reviewCount: 512,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
    }
  })

  const sushiZen = await prisma.restaurant.create({
    data: {
      ownerId: adminSushi.id, name: 'Sushi Zen', description: 'Culinária japonesa tradicional com os melhores frutos do mar frescos.',
      category: 'Sushi', address: 'Rua Liberdade, 200 - Liberdade, São Paulo', phone: '11 3333-0004',
      isOpen: true, minimumOrder: 40.0, deliveryFee: 8.99, deliveryTime: 55, rating: 4.6, reviewCount: 178,
      imageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400'
    }
  })

  const frangoGrill = await prisma.restaurant.create({
    data: {
      ownerId: adminFrango.id, name: 'FrangoGrill', description: 'Frango grelhado e assado com temperos especiais da casa.',
      category: 'Frango', address: 'Av. Rebouças, 900 - Pinheiros, São Paulo', phone: '11 3333-0005',
      isOpen: true, minimumOrder: 20.0, deliveryFee: 4.99, deliveryTime: 30, rating: 4.2, reviewCount: 95,
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400'
    }
  })

  const saladGo = await prisma.restaurant.create({
    data: {
      ownerId: adminSalad.id, name: 'Salad & Go', description: 'Comida saudável, leve e deliciosa. Saladas, wraps e bowls preparados na hora.',
      category: 'Saudável', address: 'Rua Haddock Lobo, 350 - Jardins, São Paulo', phone: '11 3333-0006',
      isOpen: true, minimumOrder: 20.0, deliveryFee: 3.99, deliveryTime: 25, rating: 4.0, reviewCount: 67,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'
    }
  })

  // Cardápio - Bella Napoli Pizza
  const catPizzas = await prisma.menuCategory.create({ data: { restaurantId: bellaNapoli.id, name: 'Pizzas Tradicionais', sortOrder: 1 } })
  const catEspeciais = await prisma.menuCategory.create({ data: { restaurantId: bellaNapoli.id, name: 'Pizzas Especiais', sortOrder: 2 } })
  const catBebidasP = await prisma.menuCategory.create({ data: { restaurantId: bellaNapoli.id, name: 'Bebidas', sortOrder: 3 } })

  const margherita = await prisma.menuItem.create({ data: { categoryId: catPizzas.id, name: 'Margherita', description: 'Molho de tomate, mussarela fresca e manjericão', price: 42.0, sortOrder: 1 } })
  const calabresa = await prisma.menuItem.create({ data: { categoryId: catPizzas.id, name: 'Calabresa', description: 'Molho de tomate, mussarela e calabresa fatiada', price: 44.0, sortOrder: 2 } })
  const quatroQueijos = await prisma.menuItem.create({ data: { categoryId: catPizzas.id, name: 'Quatro Queijos', description: 'Mussarela, parmesão, gorgonzola e catupiry', price: 52.0, sortOrder: 3 } })
  const trufa = await prisma.menuItem.create({ data: { categoryId: catEspeciais.id, name: 'Trufa com Rúcula', description: 'Creme de trufa negra, rúcula e parmesão', price: 68.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catBebidasP.id, name: 'Coca-Cola 2L', description: 'Refrigerante gelado', price: 12.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catBebidasP.id, name: 'Suco de Laranja', description: 'Natural, 500ml', price: 9.0, sortOrder: 2 } })

  // Cardápio - Pizza Express (fechado)
  const catPizzaExp = await prisma.menuCategory.create({ data: { restaurantId: pizzaExpress.id, name: 'Pizzas', sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catPizzaExp.id, name: 'Pizza Tradicional', description: 'Molho, queijo e calabresa', price: 38.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catPizzaExp.id, name: 'Pizza Mussarela', description: 'Molho e mussarela', price: 35.0, sortOrder: 2 } })

  // Cardápio - BurgerHouse
  const catBurgers = await prisma.menuCategory.create({ data: { restaurantId: burgerHouse.id, name: 'Burgers', sortOrder: 1 } })
  const catCombos = await prisma.menuCategory.create({ data: { restaurantId: burgerHouse.id, name: 'Combos', sortOrder: 2 } })
  const catBebidasB = await prisma.menuCategory.create({ data: { restaurantId: burgerHouse.id, name: 'Bebidas', sortOrder: 3 } })

  const classicBurger = await prisma.menuItem.create({ data: { categoryId: catBurgers.id, name: 'Classic Burger', description: '180g de blend artesanal, queijo cheddar, alface e tomate', price: 28.0, sortOrder: 1 } })
  const doubleSmash = await prisma.menuItem.create({ data: { categoryId: catBurgers.id, name: 'Double Smash', description: '2x 120g smashed, queijo duplo, cebola caramelizada', price: 38.0, sortOrder: 2 } })
  await prisma.menuItem.create({ data: { categoryId: catBurgers.id, name: 'Chicken Crispy', description: 'Frango empanado crocante, coleslaw e molho honey mustard', price: 32.0, sortOrder: 3 } })
  await prisma.menuItem.create({ data: { categoryId: catCombos.id, name: 'Combo Classic', description: 'Classic Burger + batata frita + refri 350ml', price: 42.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catBebidasB.id, name: 'Milkshake Chocolate', description: '400ml cremoso', price: 18.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catBebidasB.id, name: 'Cerveja Artesanal', description: 'Long neck 355ml', price: 14.0, sortOrder: 2 } })

  // Cardápio - Sushi Zen
  const catCombinados = await prisma.menuCategory.create({ data: { restaurantId: sushiZen.id, name: 'Combinados', sortOrder: 1 } })
  const catHotRoll = await prisma.menuCategory.create({ data: { restaurantId: sushiZen.id, name: 'Hot Roll', sortOrder: 2 } })
  const catBebidasS = await prisma.menuCategory.create({ data: { restaurantId: sushiZen.id, name: 'Bebidas', sortOrder: 3 } })

  const combo20 = await prisma.menuItem.create({ data: { categoryId: catCombinados.id, name: 'Combo 20 Peças', description: 'Seleção com niguiri, uramaki e hossomaki', price: 55.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catCombinados.id, name: 'Combo 30 Peças', description: 'Seleção premium com salmão, atum e peixe branco', price: 75.0, sortOrder: 2 } })
  await prisma.menuItem.create({ data: { categoryId: catHotRoll.id, name: 'Hot Philadelphia', description: '8 peças com cream cheese e salmão empanado', price: 38.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catHotRoll.id, name: 'Hot Salmão', description: '8 peças com salmão e cream cheese empanado', price: 36.0, sortOrder: 2 } })
  await prisma.menuItem.create({ data: { categoryId: catBebidasS.id, name: 'Saquê Quente', description: '180ml', price: 22.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catBebidasS.id, name: 'Chá Verde', description: 'Copo 300ml', price: 8.0, sortOrder: 2 } })

  // Cardápio - FrangoGrill
  const catPratos = await prisma.menuCategory.create({ data: { restaurantId: frangoGrill.id, name: 'Pratos', sortOrder: 1 } })
  const catAcomp = await prisma.menuCategory.create({ data: { restaurantId: frangoGrill.id, name: 'Acompanhamentos', sortOrder: 2 } })
  const catBebidasF = await prisma.menuCategory.create({ data: { restaurantId: frangoGrill.id, name: 'Bebidas', sortOrder: 3 } })

  const frangoGrelhado = await prisma.menuItem.create({ data: { categoryId: catPratos.id, name: 'Frango Grelhado', description: 'Peito de frango temperado com ervas, arroz e salada', price: 30.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catPratos.id, name: 'Frango ao Molho', description: 'Frango ao molho de cogumelos com arroz', price: 32.0, sortOrder: 2 } })
  await prisma.menuItem.create({ data: { categoryId: catPratos.id, name: 'Meio Frango Assado', description: 'Frango caipira assado com batata rústica', price: 38.0, sortOrder: 3 } })
  await prisma.menuItem.create({ data: { categoryId: catAcomp.id, name: 'Batata Rústica', description: 'Porção 200g com alecrim', price: 15.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catBebidasF.id, name: 'Suco Natural', description: 'Laranja ou limão, 400ml', price: 8.0, sortOrder: 1 } })

  // Cardápio - Salad & Go
  const catSaladas = await prisma.menuCategory.create({ data: { restaurantId: saladGo.id, name: 'Saladas', sortOrder: 1 } })
  const catWraps = await prisma.menuCategory.create({ data: { restaurantId: saladGo.id, name: 'Wraps', sortOrder: 2 } })
  const catBebidasSG = await prisma.menuCategory.create({ data: { restaurantId: saladGo.id, name: 'Bebidas', sortOrder: 3 } })

  const caesarSalad = await prisma.menuItem.create({ data: { categoryId: catSaladas.id, name: 'Caesar Salad', description: 'Alface romana, croutons, parmesão e molho caesar', price: 28.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catSaladas.id, name: 'Bowl Proteico', description: 'Quinoa, frango grelhado, abacate e tomate', price: 35.0, sortOrder: 2 } })
  await prisma.menuItem.create({ data: { categoryId: catSaladas.id, name: 'Salada Tropical', description: 'Folhas verdes, frutas da estação e castanhas', price: 26.0, sortOrder: 3 } })
  await prisma.menuItem.create({ data: { categoryId: catWraps.id, name: 'Wrap de Frango', description: 'Frango desfiado, cream cheese, tomate e alface', price: 24.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catBebidasSG.id, name: 'Água de Coco', description: 'Natural 300ml', price: 8.0, sortOrder: 1 } })
  await prisma.menuItem.create({ data: { categoryId: catBebidasSG.id, name: 'Smoothie Verde', description: 'Espinafre, maçã e gengibre 350ml', price: 14.0, sortOrder: 2 } })

  // Cupom
  await prisma.coupon.create({ data: { code: 'LUMEFOOD10', discount: 0.10, isActive: true } })

  // Helper para criar pedido com histórico
  const createOrder = async (userId: string, restaurantId: string, status: string, items: {menuItemId: string, name: string, price: number, quantity: number}[], paymentMethod: string, couponCode?: string) => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const deliveryFee = 5.99
    const discount = couponCode === 'LUMEFOOD10' ? subtotal * 0.10 : 0
    const total = subtotal + deliveryFee - discount

    const order = await prisma.order.create({
      data: {
        userId, restaurantId, status, subtotal, deliveryFee, discount, total,
        couponCode: couponCode ?? null, paymentMethod,
        addressStreet: 'Rua das Flores', addressNumber: '123',
        addressDistrict: 'Centro', addressCity: 'São Paulo', addressZip: '01310-000',
        items: { create: items }
      }
    })

    // Histórico de status
    const statusFlow = ['PENDING', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']
    const statusIndex = statusFlow.indexOf(status)
    const statuses = status === 'CANCELLED'
      ? ['PENDING', 'CANCELLED']
      : statusFlow.slice(0, statusIndex + 1)

    for (const s of statuses) {
      await prisma.orderStatusHistory.create({ data: { orderId: order.id, status: s } })
    }

    return order
  }

  // PEDIDOS - usando itens reais
  const order1 = await createOrder(joao.id, bellaNapoli.id, 'PENDING', [
    { menuItemId: margherita.id, name: 'Margherita', price: 42.0, quantity: 1 },
    { menuItemId: calabresa.id, name: 'Calabresa', price: 44.0, quantity: 1 }
  ], 'PIX')

  const order2 = await createOrder(maria.id, bellaNapoli.id, 'PENDING', [
    { menuItemId: quatroQueijos.id, name: 'Quatro Queijos', price: 52.0, quantity: 1 }
  ], 'CREDIT_CARD')

  const order3 = await createOrder(pedro.id, burgerHouse.id, 'PENDING', [
    { menuItemId: classicBurger.id, name: 'Classic Burger', price: 28.0, quantity: 2 }
  ], 'PIX')

  const order4 = await createOrder(joao.id, burgerHouse.id, 'ACCEPTED', [
    { menuItemId: doubleSmash.id, name: 'Double Smash', price: 38.0, quantity: 1 },
    { menuItemId: classicBurger.id, name: 'Classic Burger', price: 28.0, quantity: 1 }
  ], 'DEBIT_CARD')

  const order5 = await createOrder(maria.id, sushiZen.id, 'ACCEPTED', [
    { menuItemId: combo20.id, name: 'Combo 20 Peças', price: 55.0, quantity: 1 }
  ], 'CREDIT_CARD')

  const order6 = await createOrder(pedro.id, bellaNapoli.id, 'PREPARING', [
    { menuItemId: trufa.id, name: 'Trufa com Rúcula', price: 68.0, quantity: 1 }
  ], 'PIX')

  const order7 = await createOrder(joao.id, frangoGrill.id, 'PREPARING', [
    { menuItemId: frangoGrelhado.id, name: 'Frango Grelhado', price: 30.0, quantity: 2 }
  ], 'CREDIT_CARD')

  const order8 = await createOrder(maria.id, burgerHouse.id, 'OUT_FOR_DELIVERY', [
    { menuItemId: doubleSmash.id, name: 'Double Smash', price: 38.0, quantity: 1 }
  ], 'PIX')

  const order9 = await createOrder(pedro.id, sushiZen.id, 'OUT_FOR_DELIVERY', [
    { menuItemId: combo20.id, name: 'Combo 20 Peças', price: 55.0, quantity: 1 }
  ], 'DEBIT_CARD')

  const order10 = await createOrder(joao.id, bellaNapoli.id, 'DELIVERED', [
    { menuItemId: margherita.id, name: 'Margherita', price: 42.0, quantity: 2 }
  ], 'PIX', 'LUMEFOOD10')

  const order11 = await createOrder(maria.id, bellaNapoli.id, 'DELIVERED', [
    { menuItemId: calabresa.id, name: 'Calabresa', price: 44.0, quantity: 1 },
    { menuItemId: quatroQueijos.id, name: 'Quatro Queijos', price: 52.0, quantity: 1 }
  ], 'CREDIT_CARD')

  const order12 = await createOrder(pedro.id, burgerHouse.id, 'DELIVERED', [
    { menuItemId: classicBurger.id, name: 'Classic Burger', price: 28.0, quantity: 3 }
  ], 'PIX')

  const order13 = await createOrder(joao.id, sushiZen.id, 'DELIVERED', [
    { menuItemId: combo20.id, name: 'Combo 20 Peças', price: 55.0, quantity: 2 }
  ], 'CREDIT_CARD')

  const order14 = await createOrder(maria.id, frangoGrill.id, 'CANCELLED', [
    { menuItemId: frangoGrelhado.id, name: 'Frango Grelhado', price: 30.0, quantity: 1 }
  ], 'PIX')

  const order15 = await createOrder(pedro.id, saladGo.id, 'CANCELLED', [
    { menuItemId: caesarSalad.id, name: 'Caesar Salad', price: 28.0, quantity: 1 }
  ], 'DEBIT_CARD')

  // Reviews para pedidos DELIVERED
  await prisma.review.create({ data: { userId: joao.id, restaurantId: bellaNapoli.id, orderId: order10.id, rating: 5, comment: 'Melhor pizza que já comi! Entrega rápida e embalagem impecável.' } })
  await prisma.review.create({ data: { userId: maria.id, restaurantId: bellaNapoli.id, orderId: order11.id, rating: 4, comment: 'Pizza muito boa, mas demorou um pouco mais que o esperado.' } })
  await prisma.review.create({ data: { userId: pedro.id, restaurantId: burgerHouse.id, orderId: order12.id, rating: 5, comment: 'Hambúrguer incrível! Chegou quentinho e muito saboroso.' } })
  await prisma.review.create({ data: { userId: joao.id, restaurantId: sushiZen.id, orderId: order13.id, rating: 4, comment: 'Sushi fresco e bem embalado. Recomendo!' } })

  // Atualizar ratings dos restaurantes
  await prisma.restaurant.update({ where: { id: bellaNapoli.id }, data: { rating: 4.5, reviewCount: 2 } })
  await prisma.restaurant.update({ where: { id: burgerHouse.id }, data: { rating: 5.0, reviewCount: 1 } })
  await prisma.restaurant.update({ where: { id: sushiZen.id }, data: { rating: 4.0, reviewCount: 1 } })

  console.log('✅ Seed concluído com sucesso!')
  console.log('')
  console.log('📧 Credenciais:')
  console.log('  CLIENTES: joao@lumefood.com / senha123')
  console.log('  CLIENTES: maria@lumefood.com / senha123')
  console.log('  CLIENTES: pedro@lumefood.com / senha123')
  console.log('  ADMIN: admin.pizzaria@lumefood.com / admin123')
  console.log('  ADMIN: admin.burguer@lumefood.com / admin123')
  console.log('')
  console.log('🎫 Cupom: LUMEFOOD10 (10% desconto)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
