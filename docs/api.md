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

### CartItem

| 필드         | 타입      | 필수 | 설명                      | 제약   |
| ------------ | --------- | ---- | ------------------------- | ------ |
| `cartItemId` | `string`  | ✓    | 장바구니 항목 고유 식별자 |        |
| `quantity`   | `number`  | ✓    | 장바구니 수량             | 1 ~ 99 |
| `product`    | `Product` | ✓    | 상품 정보                 |        |

```json
{
  "cartItemId": "string",
  "quantity": 1,
  "product": {
    "productId": "string",
    "name": "string",
    "price": 10000,
    "image": "string",
    "stock": 5
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

```json
// 200 OK
{
  "status": "success",
  "data": Product[]
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

```json
// 201 Created
{
  "status": "success",
  "data": Product
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

```json
// 200 OK
{
  "status": "success",
  "data": CartItem[]
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

#### 응답

```json
// 201 Created
{
  "status": "success",
  "data": CartItem
}
```

> 응답으로 항목 전체를 반환해주는게 맞을까?
> https://blog.postman.com/http-patch-method/#section-8
> 전체를 돌려 주는게 더 적절하다고 판단

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

### 장바구니 수량 변경

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

| 필드       | 타입     | 필수 | 설명        |
| ---------- | -------- | ---- | ----------- |
| `quantity` | `number` | ✓    | 변경할 수량 |

#### 응답

```json
// 200 OK
{
  "status": "success",
  "data": CartItem
}
```

```json
// 400 Bad Request - 유효성 검증 실패
{
  "status": "fail",
  "data": {
    "quantity": "수량은 1 이상 99 이하의 정수여야 합니다."
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

| 필드       | 조건                       | 에러 메시지                                |
| ---------- | -------------------------- | ------------------------------------------ |
| `quantity` | 누락                       | `수량은 필수입니다.`                       |
| `quantity` | 1 미만, 99 초과, 정수 아님 | `수량은 1 이상 99 이하의 정수여야 합니다.` |

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
