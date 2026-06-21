# API 명세

## 공통 응답 형식

[JSend](https://github.com/omniti-labs/jsend) 형식을 따른다

### 성공

```json
{
  "status": "success",
  "data": object | array,
  "meta"?: object
}
```

> `meta` 필드는 JSend 표준에 없으나 필요한 경우 추가할 예정.

### 실패 (4xx 클라이언트 오류)

```json
{
  "status": "fail",
  "data": {
    "<field>": "<에러 메시지>"
  }
}
```

> `fail` 상태는 유효성 검증 실패(`400 Bad Request`)와 리소스를 찾을 수 없는 경우(`404 Not Found`) 등 모든 4xx 오류에 사용한다. `field`에는 오류가 발생한 필드명을 키로 사용한다.

### 오류 (5xx 서버 에러)

```json
{
  "status": "error",
  "message": "<에러 메시지>"
}
```

> `error` 상태는 `500 Internal Server Error`처럼 서버 내부에서 예기치 못한 오류가 발생한 경우에만 사용한다.

---

## API 데이터 구조

### Product

| 필드        | 타입     | 필수 | 설명             | 제약       |
| ----------- | -------- | ---- | ---------------- | ---------- |
| `productId` | `string` | ✓    | 상품 고유 식별자 |            |
| `name`      | `string` | ✓    | 상품명           | 최대 100자 |
| `price`     | `number` | ✓    | 상품 가격        | > 0        |
| `image`     | `string` | ✓    | 상품 이미지 URL  |            |
| `stock`     | `number` | ✓    | 재고 수량        | 0 ~ 99     |

```json
{
  "productId": "string",
  "name": "string",
  "price": 10000,
  "image": "string",
  "stock": 5
}
```

### CartItem

| 필드         | 타입      | 필수 | 설명                      | 제약   |
| ------------ | --------- | ---- | ------------------------- | ------ |
| `cartItemId` | `string`  | ✓    | 장바구니 항목 고유 식별자 |        |
| `quantity`   | `number`  | ✓    | 장바구니 수량             | 1 ~ 99 |
| `isSelected` | `boolean` | ✓    | 주문 대상 선택 여부       |        |
| `product`    | `Product` | ✓    | 상품 정보                 |        |

```json
{
  "cartItemId": "string",
  "quantity": 1,
  "isSelected": true,
  "product": {
    "productId": "string",
    "name": "string",
    "price": 10000,
    "image": "string",
    "stock": 5
  }
}
```

### OrderItemRequest

| 필드        | 타입     | 필수 | 설명             | 제약   |
| ----------- | -------- | ---- | ---------------- | ------ |
| `productId` | `string` | ✓    | 상품 고유 식별자 |        |
| `quantity`  | `number` | ✓    | 상품 주문 수량   | 1 ~ 99 |

```json
{
  "productId": "string",
  "quantity": 5
}
```

### OrderItemResponse

| 필드       | 타입      | 필수 | 설명             | 제약   |
| ---------- | --------- | ---- | ---------------- | ------ |
| `product`  | `Product` | ✓    | 주문 상품 정보   |        |
| `quantity` | `number`  | ✓    | 상품 주문 수량   | 1 ~ 99 |

```json
{
  "product": {
    "productId": "string",
    "name": "string",
    "price": 10000,
    "image": "string",
    "stock": 5
  },
  "quantity": 5
}
```

### OrderCoupon

특정 주문에서 선택 가능한 쿠폰 후보 정보. 쿠폰 원본 정보에 주문 금액, 상품 수량, 만료 시간 등을 기준으로 계산된 사용 가능 여부를 포함한다.

| 필드             | 타입      | 필수 | 설명                | 제약 |
| ---------------- | --------- | ---- | ------------------- | ---- |
| `couponId`       | `string`  | ✓    | 쿠폰 고유 식별자    |      |
| `isDisabled`     | `boolean` | ✓    | 쿠폰 사용 불가 여부 |      |
| `name`           | `string`  | ✓    | 쿠폰명              |      |
| `dueDate`        | `string`  | ✓    | 쿠폰 만료일         |      |
| `minOrderAmount` | `number`  | ✓    | 최소 주문 금액      | >= 0 |
| `availableTime`  | `object`  | ✓    | 쿠폰 사용 가능 시간 |      |

```json
{
  "couponId": "string",
  "isDisabled": false,
  "name": "2개 구매 시 1개 무료 쿠폰",
  "dueDate": "2026-07-11",
  "minOrderAmount": 100000,
  "availableTime": {
    "startTime": "09:00",
    "endTime": "18:00"
  }
}
```

### AmountSummary

| 필드             | 타입     | 필수 | 설명           | 제약 |
| ---------------- | -------- | ---- | -------------- | ---- |
| `orderAmount`    | `number` | ✓    | 상품 주문 금액 | >= 0 |
| `shippingAmount` | `number` | ✓    | 배송비         | >= 0 |
| `discountAmount` | `number` | ✓    | 할인 금액      | >= 0 |
| `totalAmount`    | `number` | ✓    | 최종 결제 금액 | >= 0 |

### CouponRecommendation

현재 저장된 주문 상태에서 최종 결제 금액이 가장 낮아지는 사용자 쿠폰 조합 정보.

| 필드        | 타입       | 필수 | 설명                              | 제약 |
| ----------- | ---------- | ---- | --------------------------------- | ---- |
| `couponIds` | `string[]` | ✓    | 추천 사용자 쿠폰 식별자 목록      | 최대 2개 |

```json
{
  "couponIds": ["user-coupon-1", "user-coupon-2"]
}
```

### Order

| 필드           | 타입                  | 필수 | 설명                           | 제약             |
| -------------- | --------------------- | ---- | ------------------------------ | ---------------- |
| `orderId`      | `string`              | ✓    | 주문 고유 식별자               |                  |
| `status`       | `string`              | ✓    | 주문 상태                      | `PENDING`, `PAID` |
| `isRemoteArea` | `boolean`             | ✓    | 도서산간 지역 여부             |                  |
| `items`        | `OrderItemResponse[]` | ✓    | 주문 상품 목록                 |                  |
| `couponIds`    | `string[]`            | ✓    | 주문에 적용된 사용자 쿠폰 식별자 목록 |                  |
| `amount`       | `AmountSummary`       | ✓    | 결제 금액 정보                 |                  |

```json
{
  "orderId": "string",
  "status": "PENDING",
  "isRemoteArea": false,
  "items": [
    {
      "product": {
        "productId": "string",
        "name": "string",
        "price": 10000,
        "image": "string",
        "stock": 5
      },
      "quantity": 1
    }
  ],
  "couponIds": ["user-coupon-1"],
  "amount": {
    "orderAmount": 10000,
    "shippingAmount": 3000,
    "discountAmount": 0,
    "totalAmount": 13000
  }
}
```

---

## 상품 API

### 상품 목록 조회

```
GET /products
```

#### 응답

**Response Body**

| 필드   | 타입        | 설명      |
| ------ | ----------- | --------- |
| `data` | `Product[]` | 상품 목록 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": [
    {
      "productId": "product-1",
      "name": "상품명",
      "price": 10000,
      "image": "https://example.com/product.png",
      "stock": 5
    }
  ]
}
```

> 상품 목록이 비어있는 경우에도 `204 No Content`가 아닌 `200 OK`와 빈 배열을 반환한다.

---

### 상품 추가

```
POST /products
```

#### 요청

**Headers**

```
Content-Type: application/json
```

**Body**

| 필드    | 타입     | 필수 | 설명            |
| ------- | -------- | ---- | --------------- |
| `name`  | `string` | ✓    | 상품명          |
| `price` | `number` | ✓    | 상품 가격       |
| `image` | `string` | ✓    | 상품 이미지 URL |
| `stock` | `number` | ✓    | 재고 수량       |

#### 응답

**Response Body**

| 필드   | 타입      | 설명           |
| ------ | --------- | -------------- |
| `data` | `Product` | 추가된 상품 정보 |

**Example**

```json
// 201 Created
{
  "status": "success",
  "data": {
    "productId": "product-1",
    "name": "상품명",
    "price": 10000,
    "image": "https://example.com/product.png",
    "stock": 5
  }
}
```

```json
// 400 Bad Request - 유효성 검증 실패
{
  "status": "fail",
  "data": {
    "name": "상품명은 필수입니다.",
    "price": "가격은 0보다 큰 숫자여야 합니다.",
    "image": "상품 이미지는 필수입니다.",
    "stock": "재고는 0 이상 99 이하의 정수여야 합니다."
  }
}
```

> 응답 예시는 복수의 필드가 동시에 실패한 경우를 나타낸다. 실제 응답에는 실패한 필드만 포함된다.

| 필드    | 조건                          | 에러 메시지                                |
| ------- | ----------------------------- | ------------------------------------------ |
| `name`  | 누락                          | `상품명은 필수입니다.`                     |
| `name`  | 100자 초과                    | `상품명은 최대 100자까지 허용됩니다.`      |
| `price` | 누락                          | `가격은 필수입니다.`                       |
| `price` | 0 이하이거나 숫자가 아닌 경우 | `가격은 0보다 큰 숫자여야 합니다.`         |
| `image` | 누락                          | `상품 이미지는 필수입니다.`                |
| `stock` | 누락                          | `재고는 필수입니다.`                       |
| `stock` | 0 미만, 99 초과, 정수 아님    | `재고는 0 이상 99 이하의 정수여야 합니다.` |

---

### 상품 삭제

```
DELETE /products/:productId
```

#### 요청

**Path Parameter**

| 파라미터    | 타입     | 설명                    |
| ----------- | -------- | ----------------------- |
| `productId` | `string` | 삭제할 상품 고유 식별자 |

#### 응답

**Response Body**

| 필드   | 타입                         | 설명               |
| ------ | ---------------------------- | ------------------ |
| `data` | `Pick<Product, "productId">` | 삭제된 상품 식별자 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": {
    "productId": "string"
  }
}
```

> 삭제된 `productId`를 반환한다. 클라이언트에서 캐시 무효화나 UI 업데이트 등에 활용할 수 있다.

```json
// 404 Not Found - 존재하지 않는 상품
{
  "status": "fail",
  "data": {
    "productId": "존재하지 않는 상품입니다."
  }
}
```

---

## 장바구니 API

> 장바구니 항목에 상품 `productId`를 그대로 사용하지 않고 고유 식별자(`cartItemId`)를 별도로 부여한다. 추후 옵션 기능 구현 시 확장성을 고려한 결정이다.

### 장바구니 조회

```
GET /cart
```

#### 응답

**Response Body**

| 필드   | 타입         | 설명             |
| ------ | ------------ | ---------------- |
| `data` | `CartItem[]` | 장바구니 항목 목록 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": [
    {
      "cartItemId": "cart-item-1",
      "quantity": 1,
      "isSelected": true,
      "product": {
        "productId": "product-1",
        "name": "상품명",
        "price": 10000,
        "image": "https://example.com/product.png",
        "stock": 5
      }
    }
  ]
}
```

> 응답에 상품 상세 정보를 포함할지, `productId`와 수량만 반환할지 고민.
> 장바구니 화면 렌더링에 필요한 상품명, 가격, 이미지, 재고 정보를 함께 반환한다.
> 이를 통해 클라이언트가 장바구니 조회 후 상품 정보를 다시 조회하지 않아도 되도록 한다.

---

### 장바구니 항목 추가

```
POST /cart
```

#### 요청

**Headers**

```
Content-Type: application/json
```

**Body**

| 필드        | 타입     | 필수 | 설명                    |
| ----------- | -------- | ---- | ----------------------- |
| `productId` | `string` | ✓    | 추가할 상품 고유 식별자 |
| `quantity`  | `number` | ✓    | 추가할 상품 수량        |

> 여러 항목을 한 번에 추가하는 방식 대신, 항목별로 개별 요청하는 방식을 채택.
> 새로 추가된 장바구니 항목의 `isSelected` 기본값은 `true`이다.

#### 응답

**Response Body**

| 필드   | 타입       | 설명                   |
| ------ | ---------- | ---------------------- |
| `data` | `CartItem` | 추가된 장바구니 항목 정보 |

**Example**

```json
// 201 Created
{
  "status": "success",
  "data": {
    "cartItemId": "cart-item-1",
    "quantity": 1,
    "isSelected": true,
    "product": {
      "productId": "product-1",
      "name": "상품명",
      "price": 10000,
      "image": "https://example.com/product.png",
      "stock": 5
    }
  }
}
```

```json
// 400 Bad Request - 유효성 검증 실패
{
  "status": "fail",
  "data": {
    "productId": "상품 ID는 필수입니다.",
    "quantity": "수량은 1 이상 99 이하의 정수여야 합니다."
  }
}
```

```json
// 400 Bad Request - 이미 장바구니에 담긴 상품
{
  "status": "fail",
  "data": {
    "productId": "이미 장바구니에 담긴 상품입니다."
  }
}
```

```json
// 404 Not Found - 존재하지 않는 상품
{
  "status": "fail",
  "data": {
    "productId": "존재하지 않는 상품입니다."
  }
}
```

> 응답 예시는 복수의 필드가 동시에 실패한 경우를 나타낸다. 실제 응답에는 실패한 필드만 포함된다.

**필드 검증**

| 필드        | 조건                       | 에러 메시지                                |
| ----------- | -------------------------- | ------------------------------------------ |
| `productId` | 누락                       | `상품 ID는 필수입니다.`                    |
| `quantity`  | 누락                       | `수량은 필수입니다.`                       |
| `quantity`  | 1 미만, 99 초과, 정수 아님 | `수량은 1 이상 99 이하의 정수여야 합니다.` |

**비즈니스 규칙**

| 조건                      | 에러 메시지                        |
| ------------------------- | ---------------------------------- |
| 이미 장바구니에 담긴 상품 | `이미 장바구니에 담긴 상품입니다.` |

---

### 장바구니 항목 변경

```
PATCH /cart/:cartItemId
```

#### 요청

**Path Parameter**

| 파라미터     | 타입     | 설명                             |
| ------------ | -------- | -------------------------------- |
| `cartItemId` | `string` | 수정할 장바구니 항목 고유 식별자 |

**Headers**

```
Content-Type: application/json
```

**Body**

| 필드         | 타입      | 필수 | 설명                |
| ------------ | --------- | ---- | ------------------- |
| `quantity`   | `number`  |      | 변경할 수량         |
| `isSelected` | `boolean` |      | 주문 대상 선택 여부 |

> 수량 변경과 선택 상태 변경을 같은 장바구니 항목 수정으로 본다. 두 필드 중 하나 이상을 포함해야 한다.

#### 응답

**Response Body**

| 필드   | 타입       | 설명                   |
| ------ | ---------- | ---------------------- |
| `data` | `CartItem` | 변경된 장바구니 항목 정보 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": {
    "cartItemId": "cart-item-1",
    "quantity": 2,
    "isSelected": true,
    "product": {
      "productId": "product-1",
      "name": "상품명",
      "price": 10000,
      "image": "https://example.com/product.png",
      "stock": 5
    }
  }
}
```

```json
// 400 Bad Request - 유효성 검증 실패
{
  "status": "fail",
  "data": {
    "body": "수정할 항목은 필수입니다.",
    "quantity": "수량은 1 이상 99 이하의 정수여야 합니다.",
    "isSelected": "선택 여부는 boolean 값이어야 합니다."
  }
}
```

```json
// 404 Not Found - 존재하지 않는 장바구니 항목
{
  "status": "fail",
  "data": {
    "cartItemId": "존재하지 않는 장바구니 항목입니다."
  }
}
```

> 응답 예시는 복수의 필드가 동시에 실패한 경우를 나타낸다. 실제 응답에는 실패한 필드만 포함된다.

| 필드         | 조건                               | 에러 메시지                                |
| ------------ | ---------------------------------- | ------------------------------------------ |
| `body`       | `quantity`, `isSelected` 모두 누락 | `수정할 항목은 필수입니다.`                |
| `quantity`   | 1 미만, 99 초과, 정수 아님         | `수량은 1 이상 99 이하의 정수여야 합니다.` |
| `isSelected` | boolean이 아닌 경우                | `선택 여부는 boolean 값이어야 합니다.`     |

---

### 장바구니 항목 삭제

```
DELETE /cart/:cartItemId
```

#### 요청

**Path Parameter**

| 파라미터     | 타입     | 설명                             |
| ------------ | -------- | -------------------------------- |
| `cartItemId` | `string` | 삭제할 장바구니 항목 고유 식별자 |

#### 응답

**Response Body**

| 필드   | 타입                             | 설명                       |
| ------ | -------------------------------- | -------------------------- |
| `data` | `Pick<CartItem, "cartItemId">` | 삭제된 장바구니 항목 식별자 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": {
    "cartItemId": "string"
  }
}
```

> 삭제된 `cartItemId`를 반환한다. 클라이언트에서 캐시 무효화나 UI 업데이트 등에 활용할 수 있다.

```json
// 404 Not Found - 존재하지 않는 장바구니 항목
{
  "status": "fail",
  "data": {
    "cartItemId": "존재하지 않는 장바구니 항목입니다."
  }
}
```

---

## 결제 금액 API

### 장바구니 결제 금액 조회

```
GET /cart/amount
```

#### 응답

**Response Body**

| 필드   | 타입            | 설명           |
| ------ | --------------- | -------------- |
| `data` | `AmountSummary` | 결제 금액 정보 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": {
    "orderAmount": 100000,
    "shippingAmount": 0,
    "discountAmount": 0,
    "totalAmount": 100000
  }
}
```

> `isSelected`가 `true`인 장바구니 항목을 기준으로 금액을 계산한다. 선택된 항목이 없는 경우 모든 금액은 `0`으로 반환한다.

---

## 주문 API

### 주문 생성

> 쿠폰 적용 및 주문 정보 검증 시 매번 모든 주문 정보를 요청에 담지 않도록, 사용자가 주문하기를 누른 시점의 선택된 장바구니 상품과 수량으로 주문 정보를 생성한다.

```
POST /order
```

#### 요청

**Headers**

```
Content-Type: application/json
```

**Body**

| 필드    | 타입                 | 필수 | 설명           |
| ------- | -------------------- | ---- | -------------- |
| `items` | `OrderItemRequest[]` | ✓    | 주문 상품 목록 |

> 요청의 `items`는 주문 생성을 위한 상품 식별자와 수량만 전달한다. 응답의 `Order.items`는 화면 렌더링에 필요한 상품 정보를 포함한다.

```json
{
  "items": [
    {
      "productId": "string",
      "quantity": 1
    }
  ]
}
```

#### 응답

**Response Body**

| 필드   | 타입    | 설명           |
| ------ | ------- | -------------- |
| `data` | `Order` | 생성된 주문 정보 |

**Example**

```json
// 201 Created
{
  "status": "success",
  "data": {
    "orderId": "order-1",
    "status": "PENDING",
    "isRemoteArea": false,
    "items": [
      {
        "product": {
          "productId": "product-1",
          "name": "상품명",
          "price": 10000,
          "image": "https://example.com/product.png",
          "stock": 5
        },
        "quantity": 1
      }
    ],
    "couponIds": [],
    "amount": {
      "orderAmount": 10000,
      "shippingAmount": 3000,
      "discountAmount": 0,
      "totalAmount": 13000
    }
  }
}
```

```json
// 400 Bad Request - 유효성 검증 실패
{
  "status": "fail",
  "data": {
    "items": "주문 상품은 1개 이상이어야 합니다.",
    "quantity": "수량은 1 이상 99 이하의 정수여야 합니다."
  }
}
```

```json
// 404 Not Found - 존재하지 않는 상품
{
  "status": "fail",
  "data": {
    "productId": "존재하지 않는 상품입니다."
  }
}
```

| 필드        | 조건                       | 에러 메시지                                |
| ----------- | -------------------------- | ------------------------------------------ |
| `items`     | 누락 또는 빈 배열          | `주문 상품은 1개 이상이어야 합니다.`       |
| `productId` | 누락                       | `상품 ID는 필수입니다.`                    |
| `quantity`  | 누락                       | `수량은 필수입니다.`                       |
| `quantity`  | 1 미만, 99 초과, 정수 아님 | `수량은 1 이상 99 이하의 정수여야 합니다.` |

---

### 주문 정보 조회

```
GET /order/:orderId
```

#### 요청

**Path Parameter**

| 파라미터  | 타입     | 설명                    |
| --------- | -------- | ----------------------- |
| `orderId` | `string` | 조회할 주문 고유 식별자 |

#### 응답

**Response Body**

| 필드   | 타입    | 설명      |
| ------ | ------- | --------- |
| `data` | `Order` | 주문 정보 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": {
    "orderId": "order-1",
    "status": "PENDING",
    "isRemoteArea": false,
    "items": [
      {
        "product": {
          "productId": "product-1",
          "name": "상품명",
          "price": 10000,
          "image": "https://example.com/product.png",
          "stock": 5
        },
        "quantity": 1
      }
    ],
    "couponIds": [],
    "amount": {
      "orderAmount": 10000,
      "shippingAmount": 3000,
      "discountAmount": 0,
      "totalAmount": 13000
    }
  }
}
```

```json
// 404 Not Found - 존재하지 않는 주문
{
  "status": "fail",
  "data": {
    "orderId": "존재하지 않는 주문입니다."
  }
}
```

---

### 주문 쿠폰 목록 조회

> 현재 시안상 쿠폰 정보는 쿠폰 적용 모달이 표시되기 전까지 사용되지 않으므로 별도의 API로 분리한다.
> `GET /order/:orderId`는 현재 적용된 사용자 쿠폰 식별자 목록을 반환하고, 이 API는 쿠폰 변경을 위해 선택 가능한 쿠폰 후보와 사용 가능 여부를 반환한다.

```
GET /order/:orderId/coupons
```

#### 요청

**Path Parameter**

| 파라미터  | 타입     | 설명                    |
| --------- | -------- | ----------------------- |
| `orderId` | `string` | 조회할 주문 고유 식별자 |

#### 응답

**Response Body**

| 필드   | 타입            | 설명                  |
| ------ | --------------- | --------------------- |
| `data` | `OrderCoupon[]` | 선택 가능한 쿠폰 목록 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": [
    {
      "couponId": "coupon-1",
      "isDisabled": false,
      "name": "2개 구매 시 1개 무료 쿠폰",
      "dueDate": "2026-07-11",
      "minOrderAmount": 100000,
      "availableTime": {
        "startTime": "09:00",
        "endTime": "18:00"
      }
    }
  ]
}
```

```json
// 404 Not Found - 존재하지 않는 주문
{
  "status": "fail",
  "data": {
    "orderId": "존재하지 않는 주문입니다."
  }
}
```

---

### 최고 혜택 쿠폰 조회

> 현재 저장된 주문 상태에서 최종 결제 금액이 가장 낮아지는 사용자 쿠폰 식별자 목록을 반환한다.
> 주문 상태는 변경하지 않으며, 추천된 쿠폰을 실제 주문 정보에 반영하려면 `PATCH /order/:orderId`를 사용한다.
> 사용 가능한 쿠폰이 없거나 쿠폰을 사용하지 않는 것이 가장 유리한 경우 빈 배열을 반환한다.

```
GET /order/:orderId/coupon-recommendation
```

#### 요청

**Path Parameter**

| 파라미터  | 타입     | 설명                    |
| --------- | -------- | ----------------------- |
| `orderId` | `string` | 조회할 주문 고유 식별자 |

#### 응답

**Response Body**

| 필드   | 타입                   | 설명             |
| ------ | ---------------------- | ---------------- |
| `data` | `CouponRecommendation` | 추천 쿠폰 조합 정보 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": {
    "couponIds": ["user-coupon-1", "user-coupon-2"]
  }
}
```

```json
// 404 Not Found - 존재하지 않는 주문
{
  "status": "fail",
  "data": {
    "orderId": "존재하지 않는 주문입니다."
  }
}
```

---

### 주문 금액 조회

> 쿼리 파라미터를 전달하지 않으면 저장된 주문의 쿠폰 및 도서산간 여부를 기준으로 금액을 반환한다. 이 경우 `GET /order/:orderId` 응답의 `amount`와 동일한 값을 반환한다.

> 쿼리 파라미터를 전달하면 해당 값을 임시 적용한 금액 미리보기를 반환하며, 주문 상태는 변경하지 않는다. 전달하지 않은 쿼리 값은 저장된 주문 값을 사용한다.

> 미리보기에서도 실제 주문 정보 수정과 동일하게 쿠폰의 존재 여부와 사용 가능 여부를 검증한다.

```
GET /order/:orderId/amount
```

#### 요청

**Path Parameter**

| 파라미터  | 타입     | 설명                    |
| --------- | -------- | ----------------------- |
| `orderId` | `string` | 조회할 주문 고유 식별자 |

**Query Parameter**

| 파라미터       | 타입      | 설명                                    |
| -------------- | --------- | --------------------------------------- |
| `isRemoteArea` | `boolean` | 도서산간 여부                           |
| `couponIds`    | `string`  | 적용할 사용자 쿠폰 식별자 목록 (`,` 구분) |

```http
GET /order/order-1/amount?couponIds=user-coupon-1,user-coupon-2&isRemoteArea=true
```

#### 응답

**Response Body**

| 필드   | 타입            | 설명           |
| ------ | --------------- | -------------- |
| `data` | `AmountSummary` | 결제 금액 정보 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": {
    "orderAmount": 100000,
    "shippingAmount": 0,
    "discountAmount": 6000,
    "totalAmount": 94000
  }
}
```

```json
// 400 Bad Request - 유효성 검증 실패
{
  "status": "fail",
  "data": {
    "couponIds": "쿠폰 ID 목록 형식이 올바르지 않습니다.",
    "couponId": "사용할 수 없는 쿠폰입니다.",
    "isRemoteArea": "도서산간 여부는 boolean 값이어야 합니다."
  }
}
```

```json
// 404 Not Found - 존재하지 않는 주문
{
  "status": "fail",
  "data": {
    "orderId": "존재하지 않는 주문입니다."
  }
}
```

```json
// 404 Not Found - 존재하지 않는 쿠폰
{
  "status": "fail",
  "data": {
    "couponId": "존재하지 않는 쿠폰입니다."
  }
}
```

| 필드           | 조건                       | 에러 메시지                                |
| -------------- | -------------------------- | ------------------------------------------ |
| `couponIds`    | 쉼표 구분 문자열 형식 아님 | `쿠폰 ID 목록 형식이 올바르지 않습니다.`   |
| `couponIds`    | 존재하지 않는 사용자 쿠폰 포함 | `존재하지 않는 쿠폰입니다.`                |
| `couponIds`    | 사용할 수 없는 사용자 쿠폰 포함 | `사용할 수 없는 쿠폰입니다.`               |
| `isRemoteArea` | boolean이 아닌 경우        | `도서산간 여부는 boolean 값이어야 합니다.` |

---

### 주문 정보 수정

```
PATCH /order/:orderId
```

#### 요청

**Path Parameter**

| 파라미터  | 타입     | 설명                    |
| --------- | -------- | ----------------------- |
| `orderId` | `string` | 수정할 주문 고유 식별자 |

**Headers**

```
Content-Type: application/json
```

**Body**

| 필드           | 타입       | 필수 | 설명                    |
| -------------- | ---------- | ---- | ----------------------- |
| `isRemoteArea` | `boolean`  |      | 도서산간 지역 여부      |
| `couponIds`    | `string[]` |      | 적용할 사용자 쿠폰 식별자 목록 |

> `isRemoteArea`, `couponIds` 중 하나 이상을 포함해야 한다.
> `couponIds`는 사용자 쿠폰 식별자 목록이며, 존재하고 현재 주문에 사용할 수 있는 사용자 쿠폰만 포함할 수 있다.

#### 응답

**Response Body**

| 필드   | 타입    | 설명             |
| ------ | ------- | ---------------- |
| `data` | `Order` | 변경된 주문 정보 |

**Example**

```json
// 200 OK
{
  "status": "success",
  "data": {
    "orderId": "order-1",
    "status": "PENDING",
    "isRemoteArea": true,
    "items": [
      {
        "product": {
          "productId": "product-1",
          "name": "상품명",
          "price": 100000,
          "image": "https://example.com/product.png",
          "stock": 5
        },
        "quantity": 1
      }
    ],
    "couponIds": ["user-coupon-1"],
    "amount": {
      "orderAmount": 100000,
      "shippingAmount": 5000,
      "discountAmount": 6000,
      "totalAmount": 99000
    }
  }
}
```

```json
// 400 Bad Request - 유효성 검증 실패
{
  "status": "fail",
  "data": {
    "body": "수정할 주문 정보는 필수입니다.",
    "isRemoteArea": "도서산간 지역 여부는 boolean 값이어야 합니다.",
    "couponIds": "쿠폰 ID 목록은 배열이어야 합니다.",
    "couponId": "사용할 수 없는 쿠폰입니다."
  }
}
```

```json
// 404 Not Found - 존재하지 않는 주문
{
  "status": "fail",
  "data": {
    "orderId": "존재하지 않는 주문입니다."
  }
}
```

```json
// 404 Not Found - 존재하지 않는 쿠폰
{
  "status": "fail",
  "data": {
    "couponId": "존재하지 않는 쿠폰입니다."
  }
}
```

| 필드           | 조건                                  | 에러 메시지                                     |
| -------------- | ------------------------------------- | ----------------------------------------------- |
| `body`         | `isRemoteArea`, `couponIds` 모두 누락 | `수정할 주문 정보는 필수입니다.`                |
| `isRemoteArea` | boolean이 아닌 경우                   | `도서산간 지역 여부는 boolean 값이어야 합니다.` |
| `couponIds`    | 배열이 아닌 경우                      | `쿠폰 ID 목록은 배열이어야 합니다.`             |
| `couponIds`    | 존재하지 않는 사용자 쿠폰 포함        | `존재하지 않는 쿠폰입니다.`                     |
| `couponIds`    | 사용할 수 없는 사용자 쿠폰 포함       | `사용할 수 없는 쿠폰입니다.`                    |
