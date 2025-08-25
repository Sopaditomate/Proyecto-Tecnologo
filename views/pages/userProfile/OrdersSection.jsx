import React from "react";

export default function OrdersSection({
  loading,
  filteredOrders,
  orderFilter,
  filterOrders,
  formatDate,
  formatPrice,
  getStatusClass,
}) {
  return (
    <div className="tab-content">
      <div className="orders-header">
        <h2>Historial de Pedidos</h2>
        <div className="orders-filters">
          <select
            className="filter-select"
            value={orderFilter}
            onChange={(e) => filterOrders(e.target.value)}
          >
            <option value="all">Todos los pedidos</option>
            <option value="recepción">En Recepción</option>
            <option value="preparando">Preparando</option>
            <option value="empaquetado">Empaquetado</option>
            <option value="envio">En Envío</option>
            <option value="entregado">Entregado</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Cargando pedidos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No tienes pedidos</h3>
          <p>Cuando realices tu primer pedido, aparecerá aquí</p>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order, index) => {
            const dateInfo = formatDate(order.fecha);
            return (
              <div key={index} className="order-card">
                <div className="order-card-header">
                  <div className="order-date-info">
                    <h4 className="order-date-primary">{dateInfo.primary}</h4>
                    <p className="order-date-secondary">{dateInfo.secondary}</p>
                  </div>
                  <span
                    className={`order-status ${getStatusClass(order.estado)}`}
                  >
                    {order.estado}
                  </span>
                </div>
                <div className="order-items">
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="order-item">
                      <div className="item-info">
                        <img
                          src={
                            item.imagen ||
                            "/placeholder.svg?height=50&width=50" ||
                            "/placeholder.svg"
                          }
                          alt={item.nombre}
                          className="item-image"
                        />
                        <div className="item-details">
                          <h5>{item.nombre}</h5>
                          <span className="item-quantity">
                            Cantidad: {item.cantidad}
                          </span>
                        </div>
                      </div>
                      <span className="item-price">
                        {formatPrice(item.precio)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
