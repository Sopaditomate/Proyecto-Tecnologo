-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-07-2025 a las 03:49:27
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `lovebites`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_activate_product_admin` (IN `p_id_product` INT)   BEGIN
  UPDATE product SET id_state = 1 WHERE id_product = p_id_product;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_new_raw_material` (IN `p_nombre` VARCHAR(50), IN `p_tipo_materia` INT, IN `p_unidad` INT, IN `p_cantidad` INT, IN `p_descripcion` VARCHAR(254), IN `p_id_administrador` INT)   BEGIN
    DECLARE v_id_material INT;

    -- Iniciar transacción
    START TRANSACTION;

    -- 1. Insertar en raw_material
    INSERT INTO raw_material (name, id_material_type, id_unit, description)
    VALUES (p_nombre, p_tipo_materia, p_unidad, p_descripcion);

    SET v_id_material = LAST_INSERT_ID();

    -- 2. Insertar en inventory
    INSERT INTO inventory (id_material, id_user, quantity)
    VALUES (v_id_material, p_id_administrador, p_cantidad);

    -- Confirmar transacción
    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_confirm_email_verification` (IN `p_user_id` INT, IN `p_token` VARCHAR(512))   BEGIN
  DECLARE v_token VARCHAR(512);
  DECLARE v_verified TINYINT(1);
  DECLARE v_count INT DEFAULT 0;

  SELECT COUNT(*) INTO v_count FROM user_account WHERE id_user = p_user_id;

  IF v_count = 0 THEN
    SELECT 'invalid_token' AS result;
  ELSE
    SELECT verify_token, verified
      INTO v_token, v_verified
      FROM user_account
     WHERE id_user = p_user_id;

    IF v_verified = 1 THEN
      -- Si ya está verificado, aunque el token sea NULL, retorna already_verified
      SELECT 'already_verified' AS result;
    ELSEIF v_token IS NULL OR v_token <> p_token THEN
      SELECT 'invalid_token' AS result;
    ELSE
      UPDATE user_account SET verified = 1, verify_token = NULL WHERE id_user = p_user_id;
      SELECT 'success' AS result;
    END IF;
  END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_user` (IN `p_email` VARCHAR(100), IN `p_pass` VARCHAR(255), IN `p_rolId` INT, IN `p_first_name` VARCHAR(50), IN `p_last_name` VARCHAR(50), IN `p_address` VARCHAR(100), IN `p_phone` VARCHAR(15))   BEGIN
    DECLARE newUserId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Si ocurre un error, revertimos todo
        ROLLBACK;
        SELECT 'Error al crear el usuario' AS message;
    END;

    START TRANSACTION;

    -- Insertamos el nuevo usuario
    INSERT INTO user_account (email, password)
    VALUES (p_email, p_pass);
    SET newUserId = LAST_INSERT_ID();

    --  Asignamos el rol
    INSERT INTO user_role (id_user, id_role)
    VALUES (newUserId, p_rolId);

    --  Insertamos el perfil del usuario
    INSERT INTO user_profile (id_user, first_name, last_name, address, phone)
    VALUES (newUserId, p_first_name, p_last_name, p_address, p_phone);

    COMMIT;

    -- Devolvemos el nuevo id
    SELECT newUserId AS userId;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_delete_inventory` (IN `p_id_inventory` INT)   BEGIN
    DECLARE v_quantity INT;

    -- Obtener la cantidad actual antes de actualizar
    SELECT quantity INTO v_quantity FROM inventory WHERE id_inventory = p_id_inventory;

    -- Actualizar el estado a eliminado
    UPDATE inventory 
    SET id_state = 3  -- Asumiendo que 3 es el estado de "eliminado"
    WHERE id_inventory = p_id_inventory;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventario no encontrado';
    ELSE
        -- Registrar el movimiento en inventory_history
        INSERT INTO inventory_history (
            id_inventory,
            id_material,
            id_inventory_movement_type,
            quantity,
            id_state
        ) VALUES (
            p_id_inventory,
            (SELECT id_material FROM inventory WHERE id_inventory = p_id_inventory),
            8, -- ID de 'Eliminación'
            v_quantity,
            3 -- Estado de eliminado
        );
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_delete_product_admin` (IN `p_id_product` INT)   BEGIN
  DECLARE v_id_state INT;

  SELECT id_state INTO v_id_state
  FROM product
  WHERE id_product = p_id_product;

IF  v_id_state = 1 THEN
  UPDATE product
  SET id_state = 2
  WHERE id_product = p_id_product;

ELSEIF v_id_state = 2 THEN
 UPDATE product
  SET id_state = 1
  WHERE id_product = p_id_product;
  END IF;


  IF ROW_COUNT() = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'product not found';
END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_delete_recipe` (IN `p_id_product` INT, IN `p_id_material` INT)   BEGIN
    UPDATE recipe
    SET id_state = 3 -- assuming 3 means deleted
    WHERE id_product = p_id_product AND id_material = p_id_material;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Recipe entry not found';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_filter_products` (IN `p_searchTerm` VARCHAR(255), IN `p_category` VARCHAR(255))   BEGIN
    SELECT * FROM vw_active_products
    WHERE
        (
            (p_searchTerm IS NULL OR p_searchTerm = '')
            OR (nameProduct COLLATE utf8mb4_general_ci LIKE CONCAT('%', p_searchTerm COLLATE utf8mb4_general_ci, '%'))
            OR (description COLLATE utf8mb4_general_ci LIKE CONCAT('%', p_searchTerm COLLATE utf8mb4_general_ci, '%'))
        )
        AND (
            p_category IS NULL OR p_category = '' OR p_category = 'Todos'
            OR category COLLATE utf8mb4_general_ci = p_category COLLATE utf8mb4_general_ci
        );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_find_user_by_email` (IN `p_email` VARCHAR(100))   BEGIN
    SELECT * 
    FROM 
        vw_active_find_user_by_email
    WHERE 
        USUARIO COLLATE utf8mb4_general_ci = p_email COLLATE utf8mb4_general_ci
    LIMIT 1;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_all_products` ()   BEGIN
    SELECT * FROM vw_active_products;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_cart_by_user` (IN `userId` INT)   BEGIN
    SELECT * FROM vw_active_cart_by_user WHERE id_usuario = userId;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_categories` ()   BEGIN
    SELECT ID, NOMBRE FROM vw_active_categories;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_client_id` (IN `p_userId` INT)   BEGIN
    SELECT 
        ID_CLIENTE
    FROM 
        vw_active_get_client_id
    WHERE 
        ID_CLIENTE = p_userId LIMIT 1;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_featured_products` (IN `p_limit` INT)   BEGIN
    SELECT 
        id, 
        nameProduct, 
        description, 
        price, 
        image, 
        rating, 
        category, 
        discount
    FROM vw_active_products
    ORDER BY rating DESC
    LIMIT p_limit;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_inventory` ()   BEGIN
    SELECT * FROM vw_active_inventory;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_inventory_history` ()   BEGIN
    SELECT * FROM vw_active_inventory_history;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_inventory_summary` ()   BEGIN
    SELECT * FROM vw_active_inventory_summary;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_material_types` ()   BEGIN
    SELECT * FROM vw_active_material_types;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_order_details` (IN `p_order_id` INT)   BEGIN
    SELECT * 
    FROM vw_active_order_details 
    WHERE ID_PEDIDO = p_order_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_product_by_id` (IN `p_id` INT)   BEGIN
    SELECT * FROM vw_active_products WHERE id = p_id LIMIT 1;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_recipe_material` (IN `product_id` INT)   BEGIN
    SELECT 
        rm.id_material AS ID_MATERIA, 
        rm.name AS NOMBRE_MATE
    FROM 
        raw_material rm
    WHERE 
        rm.id_state = 1
        AND rm.id_material NOT IN (
            SELECT r.id_material
            FROM recipe r
            WHERE r.id_product = product_id  -- Usamos el parámetro product_id
        );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_units` ()   BEGIN
    SELECT * FROM vw_active_units;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_users_info` ()   BEGIN
    SELECT 
        id_user,
        email,
        first_name,
        last_name,
        address,
        phone,
        role_name
    FROM
        vw_get_users_info;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_user_by_id` (IN `p_userId` INT)   BEGIN
  SELECT * 
  FROM vw_active_find_user_by_id 
  WHERE ID_USUARIO = p_userId 
  LIMIT 1;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_user_info` (IN `p_userId` INT)   BEGIN
    SELECT 
        ID_USUARIO,
        USUARIO,
        PASSWORD,
        ID_ROL,
        ROL_NOMBRE,
        NOMBRES,
        APELLIDOS,
        DIRECCION,
        TELEFONO
    FROM 
        vw_active_get_user_info
    WHERE 
        ID_USUARIO = p_userId 
    LIMIT 1;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_user_orders` (IN `p_user_id` INT)   BEGIN
  SELECT 
    oh.id_order AS ID_PEDIDO,
    oh.created_at AS fecha,
    os.name AS estado,
    oh.total_amount AS total,
    oh.total_discount AS descuento,
    CONCAT('[', GROUP_CONCAT(
      CONCAT(
        '{"nombre":"', REPLACE(p.name, '"', '\\"'), '",',
        '"cantidad":', od.quantity, ',',
        '"precio":', od.final_price, ',',
        '"imagen":"', REPLACE(p.image_url, '"', '\\"'), '"}'
      )
    ), ']') AS items
  FROM order_header oh
  JOIN order_status os ON oh.id_order_status = os.id_order_status
  JOIN order_detail od ON oh.id_order = od.id_order
  JOIN product p ON od.id_product = p.id_product
  WHERE oh.id_user = p_user_id
    AND oh.id_state = 1
  GROUP BY oh.id_order, oh.created_at, os.name, oh.total_amount, oh.total_discount
  ORDER BY oh.created_at DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_user_profile` (IN `p_user_id` INT)   BEGIN
  SELECT 
    a.verified, 
    p.verified_phone,
    a.email AS USUARIO,
    p.first_name AS NOMBRES,
    p.last_name AS APELLIDOS,
    p.address AS DIRECCION,
    p.phone AS TELEFONO  
  FROM user_account a
  JOIN user_profile p ON a.id_user = p.id_user
  WHERE a.id_user = p_user_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_massive_product_admin` (IN `p_id_product_type` INT, IN `p_name` VARCHAR(30), IN `p_price` DECIMAL(10,2), IN `p_description` VARCHAR(200), IN `p_image_url` VARCHAR(254), IN `p_rating` DECIMAL(3,1), IN `p_warning` VARCHAR(254))   BEGIN
    START TRANSACTION;

    INSERT INTO product (
        id_product_type,
        name,
        price,
        description,
        image_url,
        rating,
        warning
    )
    VALUES (
        p_id_product_type,
        p_name,
        p_price,
        p_description,
        p_image_url,
        p_rating,
        p_warning
    );

    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_order_detail` (IN `p_id_order` INT, IN `p_id_product` INT, IN `p_quantity` INT)   BEGIN
    INSERT INTO order_detail (id_order, id_product, quantity) VALUES (p_id_order, p_id_product, p_quantity);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_order_header` (IN `p_id_user` INT, IN `p_id_order_status` INT, OUT `p_order_id` INT)   BEGIN
    INSERT INTO order_header (id_user, id_order_status) VALUES (p_id_user, p_id_order_status);
    SET p_order_id = LAST_INSERT_ID();
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_product_admin` (IN `p_id_product_type` INT, IN `p_name` VARCHAR(30), IN `p_price` DECIMAL(10,2), IN `p_description` VARCHAR(200), IN `p_image_url` VARCHAR(254), IN `p_rating` DECIMAL(3,1), IN `p_warning` VARCHAR(254))   BEGIN
  INSERT INTO product (
    id_product_type, name, price, description, image_url, rating, warning
  ) VALUES (
    p_id_product_type, p_name, p_price, p_description, p_image_url, p_rating, p_warning
  );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_product_carrito_admin` (IN `p_id_catalog` INT, IN `p_id_product` INT, IN `p_discount` DECIMAL(5,2))   BEGIN
    -- Verifica que el producto exista en la tabla 'product'
    IF EXISTS (
        SELECT 1 FROM product WHERE id_product = p_id_product
    ) THEN
    
        -- Verifica si el producto ya está en el catálogo
        IF EXISTS (
            SELECT 1 FROM catalog WHERE id_product = p_id_product
        ) THEN
            -- Si ya existe, actualiza el descuento
            UPDATE catalog 
            SET discount = p_discount
            WHERE id_product = p_id_product;
        ELSE
            -- Si no existe, lo inserta en el catálogo
            INSERT INTO catalog (id_catalog, id_product, discount)
            VALUES (p_id_catalog, p_id_product, p_discount);
        END IF;
        
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_recipe` (IN `p_id_product` INT, IN `p_id_material` INT, IN `p_quantity_required` INT)   BEGIN
    INSERT INTO recipe (id_product, id_material, quantity_required)
    VALUES (p_id_product, p_id_material, p_quantity_required);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_cart` (IN `userId` INT, IN `items` JSON)   BEGIN
    DECLARE existingCount INT;

    SELECT COUNT(*) INTO existingCount FROM cart WHERE id_user = userId;

    IF existingCount > 0 THEN
        UPDATE cart SET items = items WHERE id_user = userId;
    ELSE
        INSERT INTO cart (id_user, items) VALUES (userId, items);
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_phone_verification` (IN `p_user_id` INT, IN `p_code` VARCHAR(10))   BEGIN
  UPDATE user_profile
  SET phone_verification_code = p_code,
      verified_phone = 0
  WHERE id_user = p_user_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_reset_token` (IN `p_userId` INT, IN `p_token` VARCHAR(512))   BEGIN
    UPDATE user_account
    SET reset_token = p_token,
        reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR)
    WHERE id_user = p_userId;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_verify_token` (IN `p_user_id` INT, IN `p_token` VARCHAR(512))   BEGIN
    UPDATE user_account
    SET verify_token = p_token
    WHERE id_user = p_user_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_toggle_user_state` (IN `p_id_user` INT)   BEGIN
  DECLARE v_current_state INT;

  -- Comprobar si el usuario existe
  IF NOT EXISTS (SELECT 1 FROM user_account WHERE id_user = p_id_user) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe.';
  END IF;

  -- Obtener el estado actual del usuario
  SELECT id_state INTO v_current_state
  FROM user_account
  WHERE id_user = p_id_user;

  -- Alternar entre los estados 1 y 2
  IF v_current_state = 1 THEN
    UPDATE user_account
    SET id_state = 2
    WHERE id_user = p_id_user;
  ELSEIF v_current_state = 2 THEN
    UPDATE user_account
    SET id_state = 1
    WHERE id_user = p_id_user;
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado de usuario no válido.';
  END IF;
  
  -- Confirmación (opcional, para indicar que la operación fue exitosa)
  SELECT 'Estado del usuario cambiado exitosamente' AS message;
  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_password_and_clean_token` (IN `p_userId` INT, IN `p_newPassword` VARCHAR(255))   BEGIN
    UPDATE user_account
    SET password = p_newPassword,
        reset_token = NULL,
        reset_token_expires = NULL
    WHERE id_user = p_userId;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_product_admin` (IN `p_id_product` INT, IN `p_id_product_type` INT, IN `p_name` VARCHAR(30), IN `p_price` DECIMAL(10,2), IN `p_description` VARCHAR(200), IN `p_image_url` VARCHAR(254), IN `p_rating` DECIMAL(3,1), IN `p_warning` VARCHAR(254))   BEGIN
  UPDATE product
  SET
    id_product_type = p_id_product_type,
    name = p_name,
    price = p_price,
    description = p_description,
    image_url = p_image_url,
    rating = p_rating,
    warning = p_warning
  WHERE id_product = p_id_product AND id_state = 1;

  IF ROW_COUNT() = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'product not found or inactive';
  END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_quantity` (IN `p_id_inventory` INT, IN `p_quantity` INT)   BEGIN
    UPDATE inventory 
    SET quantity = p_quantity 
    WHERE id_inventory = p_id_inventory;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro no encontrado';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_raw_material` (IN `p_id_inventory` INT, IN `p_name` VARCHAR(50), IN `p_id_material_type` INT, IN `p_id_unit` INT, IN `p_description` VARCHAR(254))   BEGIN
    DECLARE v_id_material INT;

    -- Obtener ID_MATERIA desde el inventario
    SELECT id_material INTO v_id_material 
    FROM inventory 
    WHERE id_inventory = p_id_inventory;

    IF v_id_material IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventario no encontrado';
    END IF;

    -- Actualizar materia_prima
    UPDATE raw_material 
    SET name = p_name, 
        id_material_type = p_id_material_type, 
        id_unit = p_id_unit, 
        description = p_description 
    WHERE id_material = v_id_material;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Materia prima no actualizada';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_recipe` (IN `p_id_product` INT, IN `p_id_material` INT, IN `p_quantity_required` INT)   BEGIN
    UPDATE recipe
    SET quantity_required = p_quantity_required
    WHERE id_product = p_id_product AND id_material = p_id_material;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Recipe entry not found';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_user_profile` (IN `p_user_id` INT, IN `p_nombres` VARCHAR(255), IN `p_apellidos` VARCHAR(255), IN `p_direccion` VARCHAR(255), IN `p_telefono` VARCHAR(20))   BEGIN
  UPDATE user_profile
  SET first_name = p_nombres,
      last_name = p_apellidos,
      address = p_direccion,
      phone = p_telefono
  WHERE id_user = p_user_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_verify_phone_code` (IN `p_user_id` INT, IN `p_code` VARCHAR(10))   BEGIN
  DECLARE v_code VARCHAR(10);

  SELECT phone_verification_code 
  INTO v_code 
  FROM user_profile 
  WHERE id_user = p_user_id;

  IF v_code = p_code THEN
    UPDATE user_profile 
    SET verified_phone = 1, 
        phone_verification_code = NULL 
    WHERE id_user = p_user_id;

    SELECT 'success' AS result;
  ELSE
    SELECT 'invalid_code' AS result;
  END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_verify_user_by_token` (IN `p_token` VARCHAR(512))   BEGIN
    DECLARE v_userId INT;

    SELECT id_user INTO v_userId FROM user_account WHERE verify_token = p_token LIMIT 1;

    IF v_userId IS NOT NULL THEN
        UPDATE user_account SET verified = 1, verify_token = NULL WHERE id_user = v_userId;
        SELECT TRUE AS verified;
    ELSE
        SELECT FALSE AS verified;
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateOrderStatus` (IN `p_order_id` INT, IN `p_status_id` INT)   BEGIN
    UPDATE order_header
    SET id_order_status = p_status_id
    WHERE id_order = p_order_id AND id_state = 1;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cart`
--

CREATE TABLE `cart` (
  `id_cart` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cart`
--

INSERT INTO `cart` (`id_cart`, `id_user`, `items`, `updated_at`, `id_state`) VALUES
(3, 700005, '[{\"id\":1200002,\"nameProduct\":\"Baguette\",\"description\":\"Pan largo y crujiente, con miga ligera\",\"price\":10000,\"image\":\"url_imagen_baguette.jpg\",\"rating\":4,\"category\":\"Natural\",\"discount\":15,\"cantidad\":1},{\"id\":1200001,\"nameProduct\":\"Pan Integral\",\"description\":\"Pan denso con salvado y fibra\",\"price\":12000,\"image\":\"url_imagen_integral.jpg\",\"rating\":4.5,\"category\":\"Tradicional\",\"discount\":0,\"cantidad\":1}]', '2025-06-19 15:29:50', 1),
(4, 700006, '[{\"id\":1200005,\"nameProduct\":\"Ciabatta\",\"description\":\"Pan italiano con una corteza crujiente y miga aireada\",\"price\":14000,\"image\":\"url_imagen_ciabatta.jpg\",\"rating\":4,\"category\":\"Sin Gluten\",\"discount\":8,\"cantidad\":1}]', '2025-06-19 12:23:51', 1),
(5, 700002, '[{\"id\":1200001,\"nameProduct\":\"Pan Integral\",\"description\":\"Pan denso con salvado y fibra\",\"price\":12000,\"image\":\"https://media.istockphoto.com/id/484013707/photo/loaf-of-bread.jpg?s=612x612&w=0&k=20&c=irE1mzL4GPte0pAih0gUslgUBuDBcM1diRrwZueC4kM=\",\"rating\":4.5,\"category\":\"Tradicional\",\"discount\":0,\"cantidad\":3},{\"id\":1200000,\"nameProduct\":\"Panetón\",\"description\":\"Pan dulce con frutas confitadas y pasas\",\"price\":15000,\"image\":\"https://cdn.pixabay.com/photo/2015/03/06/12/14/garlic-bread-661578_1280.jpg\",\"rating\":3.5,\"category\":\"Tradicional\",\"discount\":2,\"cantidad\":2}]', '2025-07-06 21:17:37', 1);

--
-- Disparadores `cart`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_cart` BEFORE DELETE ON `cart` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from cart is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `catalog`
--

CREATE TABLE `catalog` (
  `id_catalog` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `discount` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `catalog`
--

INSERT INTO `catalog` (`id_catalog`, `id_product`, `discount`, `created_at`, `updated_at`, `id_state`) VALUES
(2000000, 1200000, 10.00, '2025-06-12 20:56:20', '2025-06-12 20:56:20', 1),
(2000001, 1200001, 0.00, '2025-06-12 20:56:20', '2025-06-12 20:56:20', 1),
(2000002, 1200002, 15.00, '2025-06-12 20:56:20', '2025-06-12 20:56:20', 1),
(2000003, 1200003, 0.00, '2025-06-12 20:56:20', '2025-06-12 20:56:20', 1),
(2000004, 1200004, 5.00, '2025-06-12 20:56:20', '2025-06-12 20:56:20', 1),
(2000005, 1200005, 8.00, '2025-06-12 20:56:20', '2025-06-12 20:56:20', 1),
(2000006, 1200006, 0.00, '2025-06-12 20:56:20', '2025-06-12 20:56:20', 1);

--
-- Disparadores `catalog`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_catalog` BEFORE DELETE ON `catalog` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from catalog is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory`
--

CREATE TABLE `inventory` (
  `id_inventory` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `id_user` int(11) NOT NULL CHECK (`id_user` = 700002),
  `quantity` int(11) NOT NULL CHECK (`quantity` >= 0),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventory`
--

INSERT INTO `inventory` (`id_inventory`, `id_material`, `id_user`, `quantity`, `id_state`) VALUES
(1500016, 1400000, 700002, 50, 1),
(1500017, 1400001, 700002, 25, 1),
(1500018, 1400002, 700002, 10000, 1),
(1500019, 1400003, 700002, 2000, 1),
(1500020, 1400004, 700002, 5000, 1),
(1500021, 1400005, 700002, 10, 1),
(1500022, 1400006, 700002, 200, 1),
(1500023, 1400007, 700002, 500, 1),
(1500024, 1400008, 700002, 50, 1),
(1500025, 1400009, 700002, 20, 1),
(1500026, 1400010, 700002, 500, 1),
(1500027, 1400011, 700002, 2000, 1),
(1500028, 1400012, 700002, 1500, 1),
(1500029, 1400013, 700002, 5000, 1),
(1500030, 1400014, 700002, 600, 1),
(1500031, 1400015, 700002, 4000, 1),
(1500032, 1400018, 700002, 7899977, 3),
(1500033, 1400019, 700002, 456, 3),
(1500034, 1400020, 700002, 123, 3);

--
-- Disparadores `inventory`
--
DELIMITER $$
CREATE TRIGGER `trg_inventory_insert` AFTER INSERT ON `inventory` FOR EACH ROW BEGIN
    INSERT INTO inventory_history (
        id_inventory,
        id_material,
        id_inventory_movement_type,
        quantity,
        id_state
    ) VALUES (
        NEW.id_inventory,
        NEW.id_material,
        5, -- ID de 'Creación'
        NEW.quantity,
        NEW.id_state
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_inventory_update` AFTER UPDATE ON `inventory` FOR EACH ROW BEGIN
    DECLARE v_movement_type INT;

    IF NEW.quantity > OLD.quantity THEN
        SET v_movement_type = 6; -- ID de 'Ingreso'
        INSERT INTO inventory_history (
            id_inventory,
            id_material,
            id_inventory_movement_type,
            quantity,
            id_state
        ) VALUES (
            NEW.id_inventory,
            NEW.id_material,
            v_movement_type,
            NEW.quantity - OLD.quantity, -- Cantidad ingresada
            NEW.id_state
        );
    ELSEIF NEW.quantity < OLD.quantity THEN
        SET v_movement_type = 7; -- ID de 'Salida'
        INSERT INTO inventory_history (
            id_inventory,
            id_material,
            id_inventory_movement_type,
            quantity,
            id_state
        ) VALUES (
            NEW.id_inventory,
            NEW.id_material,
            v_movement_type,
            OLD.quantity - NEW.quantity, -- Cantidad salida
            NEW.id_state
        );
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_inventory` BEFORE DELETE ON `inventory` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from inventory is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory_history`
--

CREATE TABLE `inventory_history` (
  `id_inventory_history` int(11) NOT NULL,
  `id_inventory` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `id_inventory_movement_type` int(11) NOT NULL,
  `quantity` int(11) NOT NULL CHECK (`quantity` >= 0),
  `movement_datetime` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventory_history`
--

INSERT INTO `inventory_history` (`id_inventory_history`, `id_inventory`, `id_material`, `id_inventory_movement_type`, `quantity`, `movement_datetime`, `id_state`) VALUES
(1600000, 1500033, 1400019, 5, 456, '2025-06-25 03:04:37', 1),
(1600001, 1500033, 1400019, 6, 45210, '2025-06-25 03:19:59', 1),
(1600002, 1500033, 1400019, 7, 45210, '2025-06-25 03:20:37', 1),
(1600003, 1500033, 1400019, 8, 456, '2025-06-25 03:20:51', 3),
(1600004, 1500034, 1400020, 5, 123, '2025-06-25 12:16:41', 1),
(1600005, 1500034, 1400020, 8, 123, '2025-06-25 12:17:01', 3);

--
-- Disparadores `inventory_history`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_inventory_history` BEFORE DELETE ON `inventory_history` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from inventory_history is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory_movement_type`
--

CREATE TABLE `inventory_movement_type` (
  `id_inventory_movement_type` int(11) NOT NULL,
  `name` varchar(20) NOT NULL COMMENT 'e.g., IN, OUT',
  `description` varchar(50) DEFAULT NULL,
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventory_movement_type`
--

INSERT INTO `inventory_movement_type` (`id_inventory_movement_type`, `name`, `description`, `id_state`) VALUES
(5, 'Creación', 'Movimiento de creación de inventario', 1),
(6, 'Ingreso', 'Movimiento de ingreso de material al inventario', 1),
(7, 'Salida', 'Movimiento de salida de material del inventario', 1),
(8, 'Eliminación', 'Movimiento de eliminación de registro de inventari', 1);

--
-- Disparadores `inventory_movement_type`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_inventory_movement_type` BEFORE DELETE ON `inventory_movement_type` FOR EACH ROW BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Deleting records from inventory_movement_type is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `material_type`
--

CREATE TABLE `material_type` (
  `id_type_material` int(11) NOT NULL COMMENT 'Primary key for material types',
  `name` varchar(50) DEFAULT NULL COMMENT 'Name of the material type',
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `material_type`
--

INSERT INTO `material_type` (`id_type_material`, `name`, `id_state`) VALUES
(400000, 'Harinas', 1),
(400001, 'Azúcares y Edulcorantes', 1),
(400002, 'Grasas y Aceites', 1),
(400003, 'Levaduras y Fermentos', 1),
(400004, 'Lácteos', 1),
(400005, 'Conservantes', 1),
(400006, 'Frutas y Frutos Secos', 1),
(400007, 'Aromas y Sabores', 1),
(400008, 'Huevos y Ovoproductos', 1),
(400009, 'Sal', 1),
(400010, 'Aditivos y Mejoradores', 1),
(400011, 'Coberturas y Decoraciones', 1);

--
-- Disparadores `material_type`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_material_type` BEFORE DELETE ON `material_type` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from material_type is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_detail`
--

CREATE TABLE `order_detail` (
  `id_order_detail` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `quantity` int(11) NOT NULL CHECK (`quantity` >= 0),
  `final_price` decimal(10,2) NOT NULL CHECK (`final_price` >= 0),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `order_detail`
--

INSERT INTO `order_detail` (`id_order_detail`, `id_order`, `id_product`, `quantity`, `final_price`, `id_state`) VALUES
(1300003, 1100000, 1200000, 2, 13500.00, 1),
(1300004, 1100000, 1200004, 1, 17100.00, 1),
(1300005, 1100001, 1200001, 3, 12000.00, 1),
(1300006, 1100001, 1200002, 1, 8500.00, 1),
(1300007, 1100002, 1200006, 3, 11000.00, 1),
(1300008, 1100002, 1200004, 1, 17100.00, 1),
(1300009, 1100003, 1200000, 3, 13500.00, 1),
(1300010, 1100003, 1200005, 1, 12880.00, 1),
(1300011, 1100004, 1200001, 3, 12000.00, 1);

--
-- Disparadores `order_detail`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_order_detail` BEFORE DELETE ON `order_detail` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from order_detail is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_header`
--

CREATE TABLE `order_header` (
  `id_order` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_order_status` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_discount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `order_header`
--

INSERT INTO `order_header` (`id_order`, `id_user`, `id_order_status`, `created_at`, `total_discount`, `total_amount`, `id_state`) VALUES
(1100000, 700000, 300001, '2025-06-12 21:09:37', 3900.00, 44100.00, 1),
(1100001, 700001, 300002, '2025-06-12 21:09:37', 1500.00, 44500.00, 1),
(1100002, 700003, 300003, '2025-06-12 21:09:37', 900.00, 50100.00, 1),
(1100003, 700004, 300001, '2025-06-12 21:09:37', 5620.00, 53380.00, 1),
(1100004, 700004, 300004, '2025-06-12 21:09:37', 0.00, 36000.00, 1);

--
-- Disparadores `order_header`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_order_header` BEFORE DELETE ON `order_header` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from order_header is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_history`
--

CREATE TABLE `order_history` (
  `id_order_history` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `history_datetime` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `order_history`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_order_history` BEFORE DELETE ON `order_history` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from order_history is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_status`
--

CREATE TABLE `order_status` (
  `id_order_status` int(11) NOT NULL COMMENT 'Primary key for order statuses',
  `name` varchar(20) NOT NULL COMMENT 'Order status name',
  `description` varchar(40) DEFAULT NULL,
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `order_status`
--

INSERT INTO `order_status` (`id_order_status`, `name`, `description`, `id_state`) VALUES
(300000, 'Recepción', 'Pedido pendiente de procesamiento', 1),
(300001, 'Preparando', 'Pedido en preparación', 1),
(300002, 'Empaquetado', 'Pedido empaquetado y listo para envío', 1),
(300003, 'Envio', 'Pedido en camino al cliente', 1),
(300004, 'Entregado', 'Pedido entregado al cliente', 1);

--
-- Disparadores `order_status`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_order_status` BEFORE DELETE ON `order_status` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from order_status is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product`
--

CREATE TABLE `product` (
  `id_product` int(11) NOT NULL,
  `id_product_type` int(11) NOT NULL,
  `name` varchar(30) NOT NULL CHECK (octet_length(`name`) >= 3),
  `price` decimal(10,2) NOT NULL CHECK (`price` >= 0),
  `description` varchar(200) DEFAULT NULL CHECK (octet_length(`description`) >= 3),
  `image_url` varchar(254) NOT NULL,
  `rating` decimal(3,1) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `warning` varchar(254) NOT NULL,
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `product`
--

INSERT INTO `product` (`id_product`, `id_product_type`, `name`, `price`, `description`, `image_url`, `rating`, `warning`, `id_state`) VALUES
(1200000, 200000, 'Panetón', 15000.00, 'Pan dulce con frutas confitadas y pasas', 'https://cdn.pixabay.com/photo/2015/03/06/12/14/garlic-bread-661578_1280.jpg', 3.5, 'Conservar en un lugar fresco.', 1),
(1200001, 200000, 'Pan Integral', 12000.00, 'Pan denso con salvado y fibra', 'https://media.istockphoto.com/id/484013707/photo/loaf-of-bread.jpg?s=612x612&w=0&k=20&c=irE1mzL4GPte0pAih0gUslgUBuDBcM1diRrwZueC4kM=', 4.5, 'Consumir antes de la fecha de caducidad.', 1),
(1200002, 200001, 'Baguette', 10000.00, 'Pan largo y crujiente, con miga ligera', 'https://cdn.pixabay.com/photo/2016/06/26/16/50/bread-1480741_1280.jpg', 4.0, 'Mejor si se consume el día de compra.', 1),
(1200003, 200002, 'Pan Blanco', 5000.00, 'Pan suave y esponjoso, ideal para todo', 'https://cdn.pixabay.com/photo/2016/05/26/16/27/cinnamon-rolls-1417494_1280.jpg', 3.5, 'Almacenar en un lugar seco.', 1),
(1200004, 200003, 'Focaccia', 18000.00, 'Pan italiano con aceite de oliva y hierbas', 'https://cdn.pixabay.com/photo/2018/08/20/10/57/bread-3618640_1280.jpg', 4.5, 'Conservar en un lugar fresco.', 1),
(1200005, 200004, 'Ciabatta', 14000.00, 'Pan italiano con una corteza crujiente y miga aireada', 'https://cdn.pixabay.com/photo/2019/09/29/19/20/sweet-4514136_1280.jpg', 4.0, 'Consumir dentro de los 3 días.', 1),
(1200006, 200002, 'Pan de Ajooo', 11000.00, 'Pan suave con un delicioso sabor a ajo', 'https://cdn.pixabay.com/photo/2019/09/29/19/20/sweet-4514136_1280.jpg', 4.5, 'Calentar antes de servir.', 1),
(1200007, 200001, 'prueba', 1800.00, 'pruebita', 'https://cdn.pixabay.com/photo/2019/09/29/19/20/sweet-4514136_1280.jpg', 3.5, 'no', 1);

--
-- Disparadores `product`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_product` BEFORE DELETE ON `product` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from product is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `production`
--

CREATE TABLE `production` (
  `id_production` int(11) NOT NULL,
  `start_datetime` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_datetime` datetime DEFAULT NULL,
  `total_products` int(11) NOT NULL CHECK (`total_products` >= 0),
  `id_production_status` int(11) NOT NULL,
  `id_user` int(11) NOT NULL DEFAULT 700002 CHECK (`id_user` = 700002),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `production`
--

INSERT INTO `production` (`id_production`, `start_datetime`, `end_datetime`, `total_products`, `id_production_status`, `id_user`, `id_state`) VALUES
(1800000, '2025-06-12 21:49:38', NULL, 90, 600000, 700002, 1),
(1800001, '2025-06-12 21:49:38', NULL, 150, 600001, 700002, 1);

--
-- Disparadores `production`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_production` BEFORE DELETE ON `production` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from production is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `production_detail`
--

CREATE TABLE `production_detail` (
  `id_production` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `planned_quantity` int(11) NOT NULL CHECK (`planned_quantity` >= 0),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `production_detail`
--

INSERT INTO `production_detail` (`id_production`, `id_product`, `planned_quantity`, `id_state`) VALUES
(1800000, 1200000, 30, 1),
(1800000, 1200001, 30, 1),
(1800000, 1200002, 30, 1),
(1800001, 1200003, 50, 1),
(1800001, 1200004, 50, 1),
(1800001, 1200005, 50, 1);

--
-- Disparadores `production_detail`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_production_detail` BEFORE DELETE ON `production_detail` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from production_detail is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `production_history`
--

CREATE TABLE `production_history` (
  `id_production_history` int(11) NOT NULL,
  `id_production` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `quantity` int(11) NOT NULL CHECK (`quantity` >= 0),
  `id_production_movement_type` int(11) NOT NULL,
  `movement_datetime` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `production_history`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_production_history` BEFORE DELETE ON `production_history` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from production_history is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `production_movement_type`
--

CREATE TABLE `production_movement_type` (
  `id_production_movement_type` int(11) NOT NULL,
  `name` varchar(20) NOT NULL COMMENT 'e.g., START, FINISH, CANCEL',
  `description` varchar(50) DEFAULT NULL,
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `production_movement_type`
--

INSERT INTO `production_movement_type` (`id_production_movement_type`, `name`, `description`, `id_state`) VALUES
(1, 'Ingreso', 'Movimiento de ingreso en producción', 1),
(2, 'Salida', 'Movimiento de salida de producción', 1),
(3, 'Cancelado', 'Movimiento de cancelación de producción', 1),
(4, 'Item Eliminado', 'Movimiento de eliminación de un ítem en producción', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `production_status`
--

CREATE TABLE `production_status` (
  `id_production_status` int(11) NOT NULL COMMENT 'Primary key for production statuses',
  `name` varchar(15) NOT NULL COMMENT 'Status of production',
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `production_status`
--

INSERT INTO `production_status` (`id_production_status`, `name`, `id_state`) VALUES
(600000, 'En Producción', 1),
(600001, 'Finalizado', 1);

--
-- Disparadores `production_status`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_production_status` BEFORE DELETE ON `production_status` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from production_status is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_type`
--

CREATE TABLE `product_type` (
  `id_product_type` int(11) NOT NULL COMMENT 'Primary key for product types',
  `name` varchar(30) NOT NULL COMMENT 'Name of the product type',
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `product_type`
--

INSERT INTO `product_type` (`id_product_type`, `name`, `id_state`) VALUES
(200000, 'Tradicional', 1),
(200001, 'Natural', 1),
(200002, 'Orgánico', 1),
(200003, 'Vegano', 1),
(200004, 'Sin Gluten', 1);

--
-- Disparadores `product_type`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_product_type` BEFORE DELETE ON `product_type` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from product_type is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `raw_material`
--

CREATE TABLE `raw_material` (
  `id_material` int(11) NOT NULL,
  `id_material_type` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(254) DEFAULT NULL,
  `id_unit` int(11) NOT NULL,
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `raw_material`
--

INSERT INTO `raw_material` (`id_material`, `id_material_type`, `name`, `description`, `id_unit`, `id_state`) VALUES
(1400000, 400000, 'Haz de oros', 'Harina blanca común para panadería', 500000, 1),
(1400001, 400000, 'Corona', 'Harina de trigo integral para panes más saludables', 500000, 1),
(1400002, 400001, 'La soberana', 'Azúcar refinada utilizada para endulzar', 500001, 1),
(1400003, 400001, 'Miel', 'Miel de abeja natural para endulzar y dar sabor', 500001, 1),
(1400004, 400002, 'Gustocita', 'Mantequilla sin sal para masas y cremas', 500001, 1),
(1400005, 400002, 'Aceite Lite', 'Aceite de girasol para mezclar en recetas líquidas', 500002, 1),
(1400006, 400003, 'Levadude', 'Levadura para fermentación de masas de pan', 500001, 1),
(1400007, 400003, 'Brisa Fresca', 'Levadura fresca para panes artesanales', 500001, 1),
(1400008, 400004, 'Alqueria', 'Leche líquida para mezclar en recetas de panadería', 500002, 1),
(1400009, 400004, 'Maxima cream', 'Nata líquida para preparar cremas y rellenos', 500002, 1),
(1400010, 400005, 'Sorbato de Potasio', 'Conservante utilizado para prolongar la vida útil de productos horneados', 500001, 1),
(1400011, 400006, 'Pasas', 'Frutas deshidratadas para agregar a masas y decoraciones', 500001, 1),
(1400012, 400006, 'Nueces', 'Frutos secos para mezclar en masas y como decoración', 500001, 1),
(1400013, 400009, 'Refial', 'Sal de mesa para dar sabor y mejorar la textura de las masas', 500001, 1),
(1400014, 400008, 'AA', 'Huevos frescos para mezclar en la masa y dar estructura', 500004, 1),
(1400015, 400011, 'Roma dulce', 'Chocolate oscuro para decorar y recubrir productos', 500001, 1),
(1400018, 400000, 'pan p', 'pan p', 500000, 1),
(1400019, 400001, 'multipato', 'pato', 500002, 1),
(1400020, 400001, 'patatatatatatatatat', 'asdsad', 500002, 1);

--
-- Disparadores `raw_material`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_raw_material` BEFORE DELETE ON `raw_material` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from raw_material is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recipe`
--

CREATE TABLE `recipe` (
  `id_product` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `quantity_required` int(11) NOT NULL CHECK (`quantity_required` >= 0),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recipe`
--

INSERT INTO `recipe` (`id_product`, `id_material`, `quantity_required`, `id_state`) VALUES
(1200000, 1400000, 10, 3),
(1200000, 1400001, 5, 1),
(1200000, 1400002, 2, 1),
(1200000, 1400003, 12, 1),
(1200000, 1400004, 1, 1),
(1200000, 1400007, 0, 1),
(1200000, 1400011, 1, 1),
(1200000, 1400019, 12, 1),
(1200001, 1400001, 8, 1),
(1200001, 1400002, 1, 1),
(1200001, 1400005, 1, 1),
(1200001, 1400007, 0, 1),
(1200001, 1400013, 0, 1),
(1200002, 1400000, 6, 1),
(1200002, 1400006, 0, 1),
(1200002, 1400008, 1, 1),
(1200002, 1400013, 0, 1),
(1200003, 1400000, 5, 1),
(1200003, 1400002, 1, 1),
(1200003, 1400007, 0, 1),
(1200003, 1400008, 2, 1),
(1200004, 1400000, 6, 1),
(1200004, 1400005, 0, 1),
(1200004, 1400006, 0, 1),
(1200004, 1400013, 0, 1),
(1200005, 1400000, 5, 1),
(1200005, 1400006, 0, 1),
(1200005, 1400008, 2, 1),
(1200005, 1400013, 0, 1),
(1200006, 1400000, 2, 3),
(1200006, 1400003, 0, 3),
(1200006, 1400005, 0, 1),
(1200006, 1400006, 0, 1),
(1200006, 1400013, 0, 1);

--
-- Disparadores `recipe`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_recipe` BEFORE DELETE ON `recipe` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from recipe is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `review`
--

CREATE TABLE `review` (
  `id_review` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `comment` varchar(250) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `review`
--

INSERT INTO `review` (`id_review`, `id_user`, `id_product`, `comment`, `rating`, `created_at`, `id_state`) VALUES
(2200000, 700000, 1200006, 'Sabor a ajo delicioso, pero me gustaría que fuera un poco más crujiente.', 4, '2025-06-12 01:16:24', 1),
(2200001, 700001, 1200006, 'El pan de ajo es un favorito en casa. Siempre lo pido para acompañar la pasta.', 5, '2025-06-12 01:16:24', 1),
(2200002, 700003, 1200005, 'Me decepcionó un poco, esperaba algo más crujiente. Estaba un poco seco.', 3, '2025-06-12 01:16:24', 1),
(2200003, 700004, 1200005, 'La ciabatta es perfecta para hacer sándwiches. ¡Me encanta su textura!', 5, '2025-06-12 01:16:24', 1),
(2200004, 700001, 1200004, 'Buen pan, pero un poco salado para mi gusto. Sin embargo, sigue siendo delicioso.', 4, '2025-06-12 01:16:24', 1),
(2200005, 700003, 1200004, 'La focaccia es increíble. El aceite de oliva le da un sabor espectacular.', 5, '2025-06-12 01:16:24', 1),
(2200006, 700004, 1200003, 'Demasiado esponjoso para mi gusto. Preferiría algo más denso.', 2, '2025-06-12 01:16:24', 1),
(2200007, 700000, 1200003, 'Este pan blanco es muy suave y perfecto para hacer tostadas. ¡Me encanta!', 5, '2025-06-12 01:16:24', 1),
(2200008, 700001, 1200002, 'Buen sabor, pero se puso duro rápido. Mejor consumir el mismo día.', 3, '2025-06-12 01:16:24', 1),
(2200009, 700004, 1200002, 'Excelente baguette, crujiente y fresco. Perfecto para mis sándwiches.', 5, '2025-06-12 01:16:24', 1),
(2200010, 700003, 1200001, 'Me gustó, pero la textura es un poco densa. Aún así, lo volveré a comprar.', 4, '2025-06-12 01:16:24', 1),
(2200011, 700000, 1200001, 'El pan integral tiene un sabor excepcional, ideal para mis desayunos saludables.', 5, '2025-06-12 01:16:24', 1),
(2200012, 700001, 1200000, 'Muy rico, pero un poco más seco de lo que esperaba. Ideal para acompañar con café.', 3, '2025-06-12 01:16:24', 1),
(2200013, 700004, 1200000, 'El panetón es realmente delicioso, pero me hubiera gustado que tuviera más frutas. ¡Aún así, muy bueno!', 4, '2025-06-12 01:16:24', 1);

--
-- Disparadores `review`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_review` BEFORE DELETE ON `review` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from review is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_update_product_rating` AFTER INSERT ON `review` FOR EACH ROW BEGIN
    -- Solo calcular promedio si el review insertado está activo
    IF NEW.id_state = 1 THEN
        CALL sp_calculate_average_rating(NEW.id_product);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role`
--

CREATE TABLE `role` (
  `id_role` int(11) NOT NULL COMMENT 'Primary key for role catalog',
  `name` varchar(20) NOT NULL COMMENT 'Role name: e.g., Admin, Client, etc.',
  `id_state` int(11) NOT NULL DEFAULT 1 COMMENT 'Reference to state catalog'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `role`
--

INSERT INTO `role` (`id_role`, `name`, `id_state`) VALUES
(100000, 'Cliente', 1),
(100001, 'Administrador', 1);

--
-- Disparadores `role`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_role` BEFORE DELETE ON `role` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from role is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `state`
--

CREATE TABLE `state` (
  `id_state` int(11) NOT NULL COMMENT 'Primary key of the state catalog',
  `name` varchar(20) NOT NULL COMMENT 'Logical status (e.g., active, inactive, deleted)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `state`
--

INSERT INTO `state` (`id_state`, `name`) VALUES
(1, 'active'),
(3, 'deleted'),
(2, 'inactive');

--
-- Disparadores `state`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_state` BEFORE DELETE ON `state` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from state is not allowed. It is necessary for the correct functionality of the database.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unit`
--

CREATE TABLE `unit` (
  `id_unit` int(11) NOT NULL COMMENT 'Primary key for measurement units',
  `name` varchar(20) NOT NULL COMMENT 'Unit name, e.g., kg, liters, units',
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `unit`
--

INSERT INTO `unit` (`id_unit`, `name`, `id_state`) VALUES
(500000, 'Kilogramos', 1),
(500001, 'Gramos', 1),
(500002, 'Litros', 1),
(500003, 'Mililitros', 1),
(500004, 'Unidades', 1);

--
-- Disparadores `unit`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_unit` BEFORE DELETE ON `unit` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from unit is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_account`
--

CREATE TABLE `user_account` (
  `id_user` int(11) NOT NULL COMMENT 'Primary key for users',
  `email` varchar(100) NOT NULL COMMENT 'User email login',
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `id_state` int(11) NOT NULL DEFAULT 1,
  `reset_token` varchar(512) DEFAULT NULL COMMENT 'Reset password token',
  `reset_token_expires` datetime DEFAULT NULL COMMENT 'Reset password expiration datetime',
  `verify_token` varchar(512) DEFAULT NULL COMMENT 'Email verification token',
  `verified` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indicate if the account is verified'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user_account`
--

INSERT INTO `user_account` (`id_user`, `email`, `password`, `id_state`, `reset_token`, `reset_token_expires`, `verify_token`, `verified`) VALUES
(700000, 'juan.perez@gmail.com', 'contrasena123', 2, NULL, NULL, NULL, 0),
(700001, 'alfredo@gmail.com', 'pass12345', 2, NULL, NULL, NULL, 0),
(700002, 'espriellag8@gmail.com', '$2b$10$R1pkasXJLH.OiwebsfMElOJAVrChuojPggw8slpPXiOuz.CyaCyAy', 1, NULL, NULL, NULL, 0),
(700003, 'maria.lopez@gmail.com', 'mariapass789', 1, NULL, NULL, NULL, 0),
(700004, 'pedro.martinez@gmail.com', 'pedropass101', 1, NULL, NULL, NULL, 0),
(700005, 'papa@gmail.com', '$2b$10$Ezc9H.6Fmyo2Z6v2eQjtLOoJvD3NM/QSpq5FpI2ffIXmaF.C5rHZG', 1, NULL, NULL, NULL, 0),
(700006, 'toma@gmail.com', '$2b$10$gnYJ9Wl5PxXQOyUOkAAYWOu0BFiFg5.A2TthsIhSjM1csB0oL6SWy', 1, NULL, NULL, NULL, 0);

--
-- Disparadores `user_account`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_user_account` BEFORE DELETE ON `user_account` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from user_account is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_profile`
--

CREATE TABLE `user_profile` (
  `id_profile` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `address` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `id_state` int(11) NOT NULL DEFAULT 1,
  `phone_verification_code` varchar(10) DEFAULT NULL,
  `verified_phone` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user_profile`
--

INSERT INTO `user_profile` (`id_profile`, `id_user`, `first_name`, `last_name`, `address`, `phone`, `id_state`, `phone_verification_code`, `verified_phone`) VALUES
(800000, 700000, 'Juan', 'Pérez', 'Calle 123', '5551234', 1, NULL, 0),
(800001, 700001, 'Alfredo', 'Gómez', 'Calle sin nombre', '5554567', 1, NULL, 0),
(800002, 700002, 'Gayllermo', 'Medina', 'Avenida 456', '5555678', 1, NULL, 0),
(800003, 700003, 'María', 'López', 'Calle Las Rosas 789', '5556789', 1, NULL, 0),
(800004, 700004, 'Pedro', 'Martínez', 'Calle Los Almendros 456', '5557890', 1, NULL, 0),
(800005, 700005, 'papa', 'fried', '', '', 1, NULL, 0),
(800006, 700006, 'toma', 'te', '', '', 1, NULL, 0);

--
-- Disparadores `user_profile`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_user_profile` BEFORE DELETE ON `user_profile` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from user_profile is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_role`
--

CREATE TABLE `user_role` (
  `id_user` int(11) NOT NULL,
  `id_role` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_state` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user_role`
--

INSERT INTO `user_role` (`id_user`, `id_role`, `assigned_at`, `id_state`) VALUES
(700000, 100000, '2025-06-11 19:39:08', 1),
(700001, 100000, '2025-06-11 19:39:08', 1),
(700002, 100001, '2025-06-11 19:39:08', 1),
(700003, 100000, '2025-06-11 19:39:08', 1),
(700004, 100000, '2025-06-11 19:39:08', 1),
(700005, 100000, '2025-06-18 16:04:25', 1),
(700006, 100000, '2025-06-19 12:23:08', 1);

--
-- Disparadores `user_role`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_delete_user_role` BEFORE DELETE ON `user_role` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deleting records from user_role is not allowed. Use id_state to deactivate.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_cart_by_user`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_cart_by_user` (
`id` int(11)
,`id_usuario` int(11)
,`items` longtext
,`actualizado` timestamp
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_categories`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_categories` (
`ID` int(11)
,`NOMBRE` varchar(30)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_find_user_by_email`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_find_user_by_email` (
`ID_USUARIO` int(11)
,`USUARIO` varchar(100)
,`PASSWORD` varchar(255)
,`ESTADO` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_find_user_by_id`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_find_user_by_id` (
`ID_USUARIO` int(11)
,`USUARIO` varchar(100)
,`PASSWORD` varchar(255)
,`ESTADO` int(11)
,`reset_token` varchar(512)
,`reset_token_expires` datetime
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_get_client_id`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_get_client_id` (
`ID_CLIENTE` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_get_user_info`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_get_user_info` (
`ID_USUARIO` int(11)
,`USUARIO` varchar(100)
,`PASSWORD` varchar(255)
,`ID_ROL` int(11)
,`ROL_NOMBRE` varchar(20)
,`NOMBRES` varchar(50)
,`APELLIDOS` varchar(50)
,`DIRECCION` varchar(100)
,`TELEFONO` varchar(15)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_inventory`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_inventory` (
`ID_INVENTARIO` int(11)
,`CANTIDAD` int(11)
,`MATERIA_PRIMA` varchar(50)
,`UNIDAD` varchar(20)
,`ID_UNIDAD` int(11)
,`TIPO` varchar(50)
,`ID_TIP_MATERIA` int(11)
,`DESCRIPCION` varchar(254)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_inventory_history`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_inventory_history` (
`ID_HYS_INVENTARIO` int(11)
,`ID_INVENTARIO` int(11)
,`ID_MATERIA` int(11)
,`NOMBRE_MATERIA` varchar(50)
,`CANTIDAD` int(11)
,`TIPO_MOVIMIENTO` varchar(20)
,`FECHA_MOVIMIENTO` timestamp
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_inventory_summary`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_inventory_summary` (
`ID_MATERIA` int(11)
,`NOMBRE_MATERIA` varchar(50)
,`CANTIDAD_TOTAL` decimal(32,0)
,`UNIDAD` varchar(20)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_material_types`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_material_types` (
`ID_TIP_MATERIA` int(11)
,`NOMBRE` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_orders`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_orders` (
`ID_PEDIDO` int(11)
,`FECHA_HORA` timestamp
,`TOTAL_PAGAR` decimal(10,2)
,`ESTADO` varchar(20)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_orders_admin`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_orders_admin` (
`id_order` int(11)
,`id_user` int(11)
,`id_order_status` int(11)
,`created_at` timestamp
,`total_discount` decimal(10,2)
,`total_amount` decimal(10,2)
,`order_status_name` varchar(20)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_order_details`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_order_details` (
`ID_PEDIDO` int(11)
,`FECHA_HORA` timestamp
,`TOTAL_DESCUENTO` decimal(10,2)
,`TOTAL_PAGAR` decimal(10,2)
,`ESTADO` varchar(20)
,`ID_CLIENTE` int(11)
,`NOMBRES` varchar(50)
,`APELLIDOS` varchar(50)
,`DIRECCION` varchar(100)
,`TELEFONO` varchar(15)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_order_items`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_order_items` (
`ID_DETALLE_PEDIDO` int(11)
,`ID_PEDIDO` int(11)
,`ID_PRODUCTO` int(11)
,`CANTIDAD` int(11)
,`PRECIO_FINAL` decimal(10,2)
,`PRODUCTO_NOMBRE` varchar(30)
,`DESCRIPCION` varchar(200)
,`IMAGEN_URL` varchar(254)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_products`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_products` (
`id` int(11)
,`nameProduct` varchar(30)
,`description` varchar(200)
,`price` decimal(10,2)
,`image` varchar(254)
,`rating` decimal(3,1)
,`category` varchar(30)
,`discount` decimal(5,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_product_admin`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_product_admin` (
`ID_PRODUCTO` int(11)
,`ID_TIPO_PRO` int(11)
,`NOMBRE_TIPO_PRO` varchar(30)
,`NOMBRE_PROD` varchar(30)
,`PRECIO` decimal(10,2)
,`DESCRIPCION` varchar(200)
,`IMAGEN_URL` varchar(254)
,`NOTA_ACTUAL` decimal(3,1)
,`ADVERTENCIA` varchar(254)
,`ID_STATE` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_recipe`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_recipe` (
`ID_RECETA` int(11)
,`NOMBRE_PROD` varchar(30)
,`NOMBRE_MATE` varchar(50)
,`ID_MATERIA` int(11)
,`CANTIDAD_USAR` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_recipe_pdf`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_recipe_pdf` (
`ID_RECETA` int(11)
,`NOMBRE_PROD` varchar(30)
,`NOMBRE_MATE` varchar(50)
,`ID_MATERIA` int(11)
,`CANTIDAD_USAR` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_active_units`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_active_units` (
`ID_UNIDAD` int(11)
,`NOMBRE` varchar(20)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_get_all_orders_and_details_by_user`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_get_all_orders_and_details_by_user` (
`id_order` int(11)
,`id_user` int(11)
,`id_order_status` int(11)
,`created_at` timestamp
,`total_discount` decimal(10,2)
,`total_amount` decimal(10,2)
,`id_order_detail` int(11)
,`id_product` int(11)
,`quantity` int(11)
,`final_price` decimal(10,2)
,`product_name` varchar(30)
,`product_price` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_get_order_details_by_order_id`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_get_order_details_by_order_id` (
`id_order` int(11)
,`id_user` int(11)
,`id_order_status` int(11)
,`created_at` timestamp
,`total_discount` decimal(10,2)
,`total_amount` decimal(10,2)
,`id_order_detail` int(11)
,`id_product` int(11)
,`quantity` int(11)
,`final_price` decimal(10,2)
,`product_name` varchar(30)
,`product_price` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_get_users_info`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_get_users_info` (
`id_user` int(11)
,`email` varchar(100)
,`password` varchar(255)
,`role_name` varchar(20)
,`id_role` int(11)
,`first_name` varchar(50)
,`last_name` varchar(50)
,`address` varchar(100)
,`phone` varchar(15)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_order_status`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_order_status` (
`id_order_status` int(11)
,`status_name` varchar(20)
,`description` varchar(40)
,`id_state` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_top_product_price`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_top_product_price` (
`name` varchar(30)
,`price` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_top_product_rating`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_top_product_rating` (
`name` varchar(30)
,`rating` decimal(3,1)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_top_product_state`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_top_product_state` (
`name` varchar(30)
,`id_state` int(11)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_cart_by_user`
--
DROP TABLE IF EXISTS `vw_active_cart_by_user`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_cart_by_user`  AS SELECT `cart`.`id_cart` AS `id`, `cart`.`id_user` AS `id_usuario`, `cart`.`items` AS `items`, `cart`.`updated_at` AS `actualizado` FROM `cart` WHERE `cart`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_categories`
--
DROP TABLE IF EXISTS `vw_active_categories`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_categories`  AS SELECT `product_type`.`id_product_type` AS `ID`, `product_type`.`name` AS `NOMBRE` FROM `product_type` WHERE `product_type`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_find_user_by_email`
--
DROP TABLE IF EXISTS `vw_active_find_user_by_email`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_find_user_by_email`  AS SELECT `user_account`.`id_user` AS `ID_USUARIO`, `user_account`.`email` AS `USUARIO`, `user_account`.`password` AS `PASSWORD`, `user_account`.`id_state` AS `ESTADO` FROM `user_account` WHERE `user_account`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_find_user_by_id`
--
DROP TABLE IF EXISTS `vw_active_find_user_by_id`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_find_user_by_id`  AS SELECT `user_account`.`id_user` AS `ID_USUARIO`, `user_account`.`email` AS `USUARIO`, `user_account`.`password` AS `PASSWORD`, `user_account`.`id_state` AS `ESTADO`, `user_account`.`reset_token` AS `reset_token`, `user_account`.`reset_token_expires` AS `reset_token_expires` FROM `user_account` WHERE `user_account`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_get_client_id`
--
DROP TABLE IF EXISTS `vw_active_get_client_id`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_get_client_id`  AS SELECT `user_account`.`id_user` AS `ID_CLIENTE` FROM `user_account` WHERE `user_account`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_get_user_info`
--
DROP TABLE IF EXISTS `vw_active_get_user_info`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_get_user_info`  AS SELECT `u`.`id_user` AS `ID_USUARIO`, `u`.`email` AS `USUARIO`, `u`.`password` AS `PASSWORD`, `r`.`id_role` AS `ID_ROL`, `r`.`name` AS `ROL_NOMBRE`, `d`.`first_name` AS `NOMBRES`, `d`.`last_name` AS `APELLIDOS`, `d`.`address` AS `DIRECCION`, `d`.`phone` AS `TELEFONO` FROM (((`user_account` `u` join `user_role` `ur` on(`u`.`id_user` = `ur`.`id_user`)) join `role` `r` on(`ur`.`id_role` = `r`.`id_role`)) join `user_profile` `d` on(`u`.`id_user` = `d`.`id_user`)) WHERE `u`.`id_state` = 1 AND `ur`.`id_state` = 1 AND `r`.`id_state` = 1 AND `d`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_inventory`
--
DROP TABLE IF EXISTS `vw_active_inventory`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_inventory`  AS SELECT `inv`.`id_inventory` AS `ID_INVENTARIO`, `inv`.`quantity` AS `CANTIDAD`, `mat`.`name` AS `MATERIA_PRIMA`, `uni`.`name` AS `UNIDAD`, `uni`.`id_unit` AS `ID_UNIDAD`, `typ`.`name` AS `TIPO`, `typ`.`id_type_material` AS `ID_TIP_MATERIA`, `mat`.`description` AS `DESCRIPCION` FROM (((`inventory` `inv` join `raw_material` `mat` on(`inv`.`id_material` = `mat`.`id_material`)) join `unit` `uni` on(`mat`.`id_unit` = `uni`.`id_unit`)) join `material_type` `typ` on(`mat`.`id_material_type` = `typ`.`id_type_material`)) WHERE `inv`.`id_state` = 1 AND `mat`.`id_state` = 1 AND `uni`.`id_state` = 1 AND `typ`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_inventory_history`
--
DROP TABLE IF EXISTS `vw_active_inventory_history`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_inventory_history`  AS SELECT `h`.`id_inventory_history` AS `ID_HYS_INVENTARIO`, `h`.`id_inventory` AS `ID_INVENTARIO`, `h`.`id_material` AS `ID_MATERIA`, `m`.`name` AS `NOMBRE_MATERIA`, `h`.`quantity` AS `CANTIDAD`, `hm`.`name` AS `TIPO_MOVIMIENTO`, `h`.`movement_datetime` AS `FECHA_MOVIMIENTO` FROM ((`inventory_history` `h` join `raw_material` `m` on(`h`.`id_material` = `m`.`id_material`)) join `inventory_movement_type` `hm` on(`hm`.`id_inventory_movement_type` = `h`.`id_inventory_movement_type`)) WHERE `m`.`id_state` = 1 ORDER BY `h`.`movement_datetime` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_inventory_summary`
--
DROP TABLE IF EXISTS `vw_active_inventory_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_inventory_summary`  AS SELECT `i`.`id_material` AS `ID_MATERIA`, `m`.`name` AS `NOMBRE_MATERIA`, sum(`i`.`quantity`) AS `CANTIDAD_TOTAL`, `u`.`name` AS `UNIDAD` FROM ((`inventory` `i` join `raw_material` `m` on(`i`.`id_material` = `m`.`id_material`)) join `unit` `u` on(`m`.`id_unit` = `u`.`id_unit`)) WHERE `i`.`id_state` = 1 AND `m`.`id_state` = 1 AND `u`.`id_state` = 1 GROUP BY `i`.`id_material`, `m`.`name`, `u`.`name` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_material_types`
--
DROP TABLE IF EXISTS `vw_active_material_types`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_material_types`  AS SELECT `material_type`.`id_type_material` AS `ID_TIP_MATERIA`, `material_type`.`name` AS `NOMBRE` FROM `material_type` WHERE `material_type`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_orders`
--
DROP TABLE IF EXISTS `vw_active_orders`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_orders`  AS SELECT `p`.`id_order` AS `ID_PEDIDO`, `p`.`created_at` AS `FECHA_HORA`, `p`.`total_amount` AS `TOTAL_PAGAR`, `e`.`name` AS `ESTADO` FROM (`order_header` `p` join `order_status` `e` on(`p`.`id_order_status` = `e`.`id_order_status`)) WHERE `p`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_orders_admin`
--
DROP TABLE IF EXISTS `vw_active_orders_admin`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_orders_admin`  AS SELECT `oh`.`id_order` AS `id_order`, `oh`.`id_user` AS `id_user`, `oh`.`id_order_status` AS `id_order_status`, `oh`.`created_at` AS `created_at`, `oh`.`total_discount` AS `total_discount`, `oh`.`total_amount` AS `total_amount`, `os`.`name` AS `order_status_name` FROM (`order_header` `oh` join `order_status` `os` on(`oh`.`id_order_status` = `os`.`id_order_status`)) WHERE `oh`.`id_state` = 1 AND `os`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_order_details`
--
DROP TABLE IF EXISTS `vw_active_order_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_order_details`  AS SELECT `p`.`id_order` AS `ID_PEDIDO`, `p`.`created_at` AS `FECHA_HORA`, `p`.`total_discount` AS `TOTAL_DESCUENTO`, `p`.`total_amount` AS `TOTAL_PAGAR`, `e`.`name` AS `ESTADO`, `u`.`id_user` AS `ID_CLIENTE`, `up`.`first_name` AS `NOMBRES`, `up`.`last_name` AS `APELLIDOS`, `up`.`address` AS `DIRECCION`, `up`.`phone` AS `TELEFONO` FROM (((`order_header` `p` join `order_status` `e` on(`p`.`id_order_status` = `e`.`id_order_status`)) join `user_account` `u` on(`p`.`id_user` = `u`.`id_user`)) join `user_profile` `up` on(`u`.`id_user` = `up`.`id_user`)) WHERE `p`.`id_state` = 1 AND `u`.`id_user` <> 700002 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_order_items`
--
DROP TABLE IF EXISTS `vw_active_order_items`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_order_items`  AS SELECT `od`.`id_order_detail` AS `ID_DETALLE_PEDIDO`, `od`.`id_order` AS `ID_PEDIDO`, `od`.`id_product` AS `ID_PRODUCTO`, `od`.`quantity` AS `CANTIDAD`, `od`.`final_price` AS `PRECIO_FINAL`, `p`.`name` AS `PRODUCTO_NOMBRE`, `p`.`description` AS `DESCRIPCION`, `p`.`image_url` AS `IMAGEN_URL` FROM (`order_detail` `od` join `product` `p` on(`od`.`id_product` = `p`.`id_product`)) WHERE `od`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_products`
--
DROP TABLE IF EXISTS `vw_active_products`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_products`  AS SELECT `p`.`id_product` AS `id`, `p`.`name` AS `nameProduct`, `p`.`description` AS `description`, `p`.`price` AS `price`, `p`.`image_url` AS `image`, `p`.`rating` AS `rating`, `tp`.`name` AS `category`, `c`.`discount` AS `discount` FROM ((`product` `p` join `product_type` `tp` on(`p`.`id_product_type` = `tp`.`id_product_type`)) join `catalog` `c` on(`p`.`id_product` = `c`.`id_product`)) WHERE `p`.`id_state` = 1 AND `tp`.`id_state` = 1 AND `c`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_product_admin`
--
DROP TABLE IF EXISTS `vw_active_product_admin`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_product_admin`  AS SELECT `p`.`id_product` AS `ID_PRODUCTO`, `p`.`id_product_type` AS `ID_TIPO_PRO`, `t`.`name` AS `NOMBRE_TIPO_PRO`, `p`.`name` AS `NOMBRE_PROD`, `p`.`price` AS `PRECIO`, `p`.`description` AS `DESCRIPCION`, `p`.`image_url` AS `IMAGEN_URL`, `p`.`rating` AS `NOTA_ACTUAL`, `p`.`warning` AS `ADVERTENCIA`, `p`.`id_state` AS `ID_STATE` FROM (`product` `p` join `product_type` `t` on(`p`.`id_product_type` = `t`.`id_product_type`)) WHERE (`p`.`id_state` = 1 OR `p`.`id_state` = 2) AND (`t`.`id_state` = 1 OR `t`.`id_state` = 2) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_recipe`
--
DROP TABLE IF EXISTS `vw_active_recipe`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_recipe`  AS SELECT `r`.`id_product` AS `ID_RECETA`, `p`.`name` AS `NOMBRE_PROD`, `m`.`name` AS `NOMBRE_MATE`, `m`.`id_material` AS `ID_MATERIA`, `r`.`quantity_required` AS `CANTIDAD_USAR` FROM ((`recipe` `r` join `product` `p` on(`p`.`id_product` = `r`.`id_product`)) join `raw_material` `m` on(`m`.`id_material` = `r`.`id_material`)) WHERE `r`.`id_state` = 1 AND `p`.`id_state` = 1 AND `m`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_recipe_pdf`
--
DROP TABLE IF EXISTS `vw_active_recipe_pdf`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_recipe_pdf`  AS SELECT `r`.`id_product` AS `ID_RECETA`, `p`.`name` AS `NOMBRE_PROD`, `m`.`name` AS `NOMBRE_MATE`, `m`.`id_material` AS `ID_MATERIA`, `r`.`quantity_required` AS `CANTIDAD_USAR` FROM ((`recipe` `r` join `product` `p` on(`p`.`id_product` = `r`.`id_product`)) join `raw_material` `m` on(`m`.`id_material` = `r`.`id_material`)) WHERE `r`.`id_state` = 1 AND `p`.`id_state` = 1 AND `m`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_active_units`
--
DROP TABLE IF EXISTS `vw_active_units`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_units`  AS SELECT `unit`.`id_unit` AS `ID_UNIDAD`, `unit`.`name` AS `NOMBRE` FROM `unit` WHERE `unit`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_get_all_orders_and_details_by_user`
--
DROP TABLE IF EXISTS `vw_get_all_orders_and_details_by_user`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_get_all_orders_and_details_by_user`  AS SELECT `oh`.`id_order` AS `id_order`, `oh`.`id_user` AS `id_user`, `oh`.`id_order_status` AS `id_order_status`, `oh`.`created_at` AS `created_at`, `oh`.`total_discount` AS `total_discount`, `oh`.`total_amount` AS `total_amount`, `od`.`id_order_detail` AS `id_order_detail`, `od`.`id_product` AS `id_product`, `od`.`quantity` AS `quantity`, `od`.`final_price` AS `final_price`, `p`.`name` AS `product_name`, `p`.`price` AS `product_price` FROM ((`order_header` `oh` join `order_detail` `od` on(`oh`.`id_order` = `od`.`id_order`)) join `product` `p` on(`od`.`id_product` = `p`.`id_product`)) WHERE `oh`.`id_state` = 1 AND `od`.`id_state` = 1 AND `p`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_get_order_details_by_order_id`
--
DROP TABLE IF EXISTS `vw_get_order_details_by_order_id`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_get_order_details_by_order_id`  AS SELECT `oh`.`id_order` AS `id_order`, `oh`.`id_user` AS `id_user`, `oh`.`id_order_status` AS `id_order_status`, `oh`.`created_at` AS `created_at`, `oh`.`total_discount` AS `total_discount`, `oh`.`total_amount` AS `total_amount`, `od`.`id_order_detail` AS `id_order_detail`, `od`.`id_product` AS `id_product`, `od`.`quantity` AS `quantity`, `od`.`final_price` AS `final_price`, `p`.`name` AS `product_name`, `p`.`price` AS `product_price` FROM ((`order_header` `oh` join `order_detail` `od` on(`oh`.`id_order` = `od`.`id_order`)) join `product` `p` on(`od`.`id_product` = `p`.`id_product`)) WHERE `oh`.`id_state` = 1 AND `od`.`id_state` = 1 AND `p`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_get_users_info`
--
DROP TABLE IF EXISTS `vw_get_users_info`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_get_users_info`  AS SELECT `u`.`id_user` AS `id_user`, `u`.`email` AS `email`, `u`.`password` AS `password`, `r`.`name` AS `role_name`, `r`.`id_role` AS `id_role`, `d`.`first_name` AS `first_name`, `d`.`last_name` AS `last_name`, `d`.`address` AS `address`, `d`.`phone` AS `phone` FROM (((`user_account` `u` join `user_role` `ur` on(`u`.`id_user` = `ur`.`id_user`)) join `role` `r` on(`ur`.`id_role` = `r`.`id_role` and `r`.`id_role` = 100000)) join `user_profile` `d` on(`u`.`id_user` = `d`.`id_user`)) WHERE `u`.`id_state` = 1 OR `u`.`id_state` = 2 AND `ur`.`id_state` = 1 OR `ur`.`id_state` = 2 AND `r`.`id_state` = 1 OR `r`.`id_state` = 2 AND `d`.`id_state` = 1 OR `d`.`id_state` = 2 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_order_status`
--
DROP TABLE IF EXISTS `vw_order_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_order_status`  AS SELECT `os`.`id_order_status` AS `id_order_status`, `os`.`name` AS `status_name`, `os`.`description` AS `description`, `os`.`id_state` AS `id_state` FROM `order_status` AS `os` WHERE `os`.`id_state` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_top_product_price`
--
DROP TABLE IF EXISTS `vw_top_product_price`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_top_product_price`  AS SELECT `product`.`name` AS `name`, `product`.`price` AS `price` FROM `product` ORDER BY `product`.`price` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_top_product_rating`
--
DROP TABLE IF EXISTS `vw_top_product_rating`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_top_product_rating`  AS SELECT `product`.`name` AS `name`, `product`.`rating` AS `rating` FROM `product` ORDER BY `product`.`rating` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_top_product_state`
--
DROP TABLE IF EXISTS `vw_top_product_state`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_top_product_state`  AS SELECT `product`.`name` AS `name`, `product`.`id_state` AS `id_state` FROM `product` WHERE `product`.`id_state` = 1 OR `product`.`id_state` = 2 ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id_cart`),
  ADD UNIQUE KEY `unique_user_cart` (`id_user`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `catalog`
--
ALTER TABLE `catalog`
  ADD PRIMARY KEY (`id_catalog`),
  ADD UNIQUE KEY `uq_catalog_id_product` (`id_product`),
  ADD KEY `id_product` (`id_product`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id_inventory`),
  ADD KEY `id_material` (`id_material`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `inventory_history`
--
ALTER TABLE `inventory_history`
  ADD PRIMARY KEY (`id_inventory_history`),
  ADD KEY `id_inventory` (`id_inventory`),
  ADD KEY `id_material` (`id_material`),
  ADD KEY `id_state` (`id_state`),
  ADD KEY `id_inventory_movement_type` (`id_inventory_movement_type`);

--
-- Indices de la tabla `inventory_movement_type`
--
ALTER TABLE `inventory_movement_type`
  ADD PRIMARY KEY (`id_inventory_movement_type`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `material_type`
--
ALTER TABLE `material_type`
  ADD PRIMARY KEY (`id_type_material`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `order_detail`
--
ALTER TABLE `order_detail`
  ADD PRIMARY KEY (`id_order_detail`),
  ADD KEY `id_order` (`id_order`),
  ADD KEY `id_product` (`id_product`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `order_header`
--
ALTER TABLE `order_header`
  ADD PRIMARY KEY (`id_order`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_order_status` (`id_order_status`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `order_history`
--
ALTER TABLE `order_history`
  ADD PRIMARY KEY (`id_order_history`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_order` (`id_order`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `order_status`
--
ALTER TABLE `order_status`
  ADD PRIMARY KEY (`id_order_status`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id_product`),
  ADD KEY `id_product_type` (`id_product_type`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `production`
--
ALTER TABLE `production`
  ADD PRIMARY KEY (`id_production`),
  ADD KEY `id_production_status` (`id_production_status`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `production_detail`
--
ALTER TABLE `production_detail`
  ADD PRIMARY KEY (`id_production`,`id_product`),
  ADD KEY `id_product` (`id_product`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `production_history`
--
ALTER TABLE `production_history`
  ADD PRIMARY KEY (`id_production_history`),
  ADD KEY `id_production` (`id_production`,`id_product`),
  ADD KEY `id_state` (`id_state`),
  ADD KEY `id_production_movement_type` (`id_production_movement_type`);

--
-- Indices de la tabla `production_movement_type`
--
ALTER TABLE `production_movement_type`
  ADD PRIMARY KEY (`id_production_movement_type`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `production_status`
--
ALTER TABLE `production_status`
  ADD PRIMARY KEY (`id_production_status`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `product_type`
--
ALTER TABLE `product_type`
  ADD PRIMARY KEY (`id_product_type`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `raw_material`
--
ALTER TABLE `raw_material`
  ADD PRIMARY KEY (`id_material`),
  ADD KEY `id_material_type` (`id_material_type`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `recipe`
--
ALTER TABLE `recipe`
  ADD PRIMARY KEY (`id_product`,`id_material`),
  ADD KEY `id_material` (`id_material`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id_review`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_product` (`id_product`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id_role`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `state`
--
ALTER TABLE `state`
  ADD PRIMARY KEY (`id_state`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `unit`
--
ALTER TABLE `unit`
  ADD PRIMARY KEY (`id_unit`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `user_account`
--
ALTER TABLE `user_account`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `user_profile`
--
ALTER TABLE `user_profile`
  ADD PRIMARY KEY (`id_profile`),
  ADD UNIQUE KEY `id_user` (`id_user`),
  ADD KEY `id_state` (`id_state`);

--
-- Indices de la tabla `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`id_user`,`id_role`),
  ADD KEY `id_role` (`id_role`),
  ADD KEY `id_state` (`id_state`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cart`
--
ALTER TABLE `cart`
  MODIFY `id_cart` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `catalog`
--
ALTER TABLE `catalog`
  MODIFY `id_catalog` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2000012;

--
-- AUTO_INCREMENT de la tabla `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id_inventory` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1500035;

--
-- AUTO_INCREMENT de la tabla `inventory_history`
--
ALTER TABLE `inventory_history`
  MODIFY `id_inventory_history` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1600006;

--
-- AUTO_INCREMENT de la tabla `inventory_movement_type`
--
ALTER TABLE `inventory_movement_type`
  MODIFY `id_inventory_movement_type` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `material_type`
--
ALTER TABLE `material_type`
  MODIFY `id_type_material` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key for material types', AUTO_INCREMENT=400012;

--
-- AUTO_INCREMENT de la tabla `order_detail`
--
ALTER TABLE `order_detail`
  MODIFY `id_order_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1300012;

--
-- AUTO_INCREMENT de la tabla `order_header`
--
ALTER TABLE `order_header`
  MODIFY `id_order` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1100005;

--
-- AUTO_INCREMENT de la tabla `order_history`
--
ALTER TABLE `order_history`
  MODIFY `id_order_history` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2100000;

--
-- AUTO_INCREMENT de la tabla `order_status`
--
ALTER TABLE `order_status`
  MODIFY `id_order_status` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key for order statuses', AUTO_INCREMENT=300005;

--
-- AUTO_INCREMENT de la tabla `product`
--
ALTER TABLE `product`
  MODIFY `id_product` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1200008;

--
-- AUTO_INCREMENT de la tabla `production`
--
ALTER TABLE `production`
  MODIFY `id_production` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1800002;

--
-- AUTO_INCREMENT de la tabla `production_history`
--
ALTER TABLE `production_history`
  MODIFY `id_production_history` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1900000;

--
-- AUTO_INCREMENT de la tabla `production_movement_type`
--
ALTER TABLE `production_movement_type`
  MODIFY `id_production_movement_type` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `production_status`
--
ALTER TABLE `production_status`
  MODIFY `id_production_status` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key for production statuses', AUTO_INCREMENT=600002;

--
-- AUTO_INCREMENT de la tabla `product_type`
--
ALTER TABLE `product_type`
  MODIFY `id_product_type` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key for product types', AUTO_INCREMENT=200005;

--
-- AUTO_INCREMENT de la tabla `raw_material`
--
ALTER TABLE `raw_material`
  MODIFY `id_material` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1400021;

--
-- AUTO_INCREMENT de la tabla `review`
--
ALTER TABLE `review`
  MODIFY `id_review` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2200014;

--
-- AUTO_INCREMENT de la tabla `role`
--
ALTER TABLE `role`
  MODIFY `id_role` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key for role catalog', AUTO_INCREMENT=100002;

--
-- AUTO_INCREMENT de la tabla `state`
--
ALTER TABLE `state`
  MODIFY `id_state` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key of the state catalog', AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `unit`
--
ALTER TABLE `unit`
  MODIFY `id_unit` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key for measurement units', AUTO_INCREMENT=500005;

--
-- AUTO_INCREMENT de la tabla `user_account`
--
ALTER TABLE `user_account`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key for users', AUTO_INCREMENT=700007;

--
-- AUTO_INCREMENT de la tabla `user_profile`
--
ALTER TABLE `user_profile`
  MODIFY `id_profile` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=800007;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user_account` (`id_user`),
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `catalog`
--
ALTER TABLE `catalog`
  ADD CONSTRAINT `catalog_ibfk_1` FOREIGN KEY (`id_product`) REFERENCES `product` (`id_product`),
  ADD CONSTRAINT `catalog_ibfk_2` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`id_material`) REFERENCES `raw_material` (`id_material`),
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user_account` (`id_user`),
  ADD CONSTRAINT `inventory_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `inventory_history`
--
ALTER TABLE `inventory_history`
  ADD CONSTRAINT `inventory_history_ibfk_1` FOREIGN KEY (`id_inventory`) REFERENCES `inventory` (`id_inventory`),
  ADD CONSTRAINT `inventory_history_ibfk_2` FOREIGN KEY (`id_material`) REFERENCES `raw_material` (`id_material`),
  ADD CONSTRAINT `inventory_history_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`),
  ADD CONSTRAINT `inventory_history_ibfk_4` FOREIGN KEY (`id_inventory_movement_type`) REFERENCES `inventory_movement_type` (`id_inventory_movement_type`);

--
-- Filtros para la tabla `inventory_movement_type`
--
ALTER TABLE `inventory_movement_type`
  ADD CONSTRAINT `inventory_movement_type_ibfk_1` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `material_type`
--
ALTER TABLE `material_type`
  ADD CONSTRAINT `material_type_ibfk_1` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `order_detail`
--
ALTER TABLE `order_detail`
  ADD CONSTRAINT `order_detail_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `order_header` (`id_order`),
  ADD CONSTRAINT `order_detail_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `product` (`id_product`),
  ADD CONSTRAINT `order_detail_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `order_header`
--
ALTER TABLE `order_header`
  ADD CONSTRAINT `order_header_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user_account` (`id_user`),
  ADD CONSTRAINT `order_header_ibfk_2` FOREIGN KEY (`id_order_status`) REFERENCES `order_status` (`id_order_status`),
  ADD CONSTRAINT `order_header_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `order_history`
--
ALTER TABLE `order_history`
  ADD CONSTRAINT `order_history_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user_account` (`id_user`),
  ADD CONSTRAINT `order_history_ibfk_2` FOREIGN KEY (`id_order`) REFERENCES `order_header` (`id_order`),
  ADD CONSTRAINT `order_history_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `order_status`
--
ALTER TABLE `order_status`
  ADD CONSTRAINT `order_status_ibfk_1` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`id_product_type`) REFERENCES `product_type` (`id_product_type`),
  ADD CONSTRAINT `product_ibfk_2` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `production`
--
ALTER TABLE `production`
  ADD CONSTRAINT `production_ibfk_1` FOREIGN KEY (`id_production_status`) REFERENCES `production_status` (`id_production_status`),
  ADD CONSTRAINT `production_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user_account` (`id_user`),
  ADD CONSTRAINT `production_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `production_detail`
--
ALTER TABLE `production_detail`
  ADD CONSTRAINT `production_detail_ibfk_1` FOREIGN KEY (`id_production`) REFERENCES `production` (`id_production`),
  ADD CONSTRAINT `production_detail_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `product` (`id_product`),
  ADD CONSTRAINT `production_detail_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `production_history`
--
ALTER TABLE `production_history`
  ADD CONSTRAINT `production_history_ibfk_1` FOREIGN KEY (`id_production`,`id_product`) REFERENCES `production_detail` (`id_production`, `id_product`),
  ADD CONSTRAINT `production_history_ibfk_2` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`),
  ADD CONSTRAINT `production_history_ibfk_3` FOREIGN KEY (`id_production_movement_type`) REFERENCES `production_movement_type` (`id_production_movement_type`);

--
-- Filtros para la tabla `production_movement_type`
--
ALTER TABLE `production_movement_type`
  ADD CONSTRAINT `production_movement_type_ibfk_1` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `production_status`
--
ALTER TABLE `production_status`
  ADD CONSTRAINT `production_status_ibfk_1` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `product_type`
--
ALTER TABLE `product_type`
  ADD CONSTRAINT `product_type_ibfk_1` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `raw_material`
--
ALTER TABLE `raw_material`
  ADD CONSTRAINT `raw_material_ibfk_1` FOREIGN KEY (`id_material_type`) REFERENCES `material_type` (`id_type_material`),
  ADD CONSTRAINT `raw_material_ibfk_2` FOREIGN KEY (`id_unit`) REFERENCES `unit` (`id_unit`),
  ADD CONSTRAINT `raw_material_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `recipe`
--
ALTER TABLE `recipe`
  ADD CONSTRAINT `recipe_ibfk_1` FOREIGN KEY (`id_product`) REFERENCES `product` (`id_product`),
  ADD CONSTRAINT `recipe_ibfk_2` FOREIGN KEY (`id_material`) REFERENCES `raw_material` (`id_material`),
  ADD CONSTRAINT `recipe_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user_account` (`id_user`),
  ADD CONSTRAINT `review_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `product` (`id_product`),
  ADD CONSTRAINT `review_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `role`
--
ALTER TABLE `role`
  ADD CONSTRAINT `role_ibfk_1` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `unit`
--
ALTER TABLE `unit`
  ADD CONSTRAINT `unit_ibfk_1` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `user_account`
--
ALTER TABLE `user_account`
  ADD CONSTRAINT `user_account_ibfk_1` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `user_profile`
--
ALTER TABLE `user_profile`
  ADD CONSTRAINT `user_profile_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user_account` (`id_user`),
  ADD CONSTRAINT `user_profile_ibfk_2` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);

--
-- Filtros para la tabla `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user_account` (`id_user`),
  ADD CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`id_role`) REFERENCES `role` (`id_role`),
  ADD CONSTRAINT `user_role_ibfk_3` FOREIGN KEY (`id_state`) REFERENCES `state` (`id_state`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
