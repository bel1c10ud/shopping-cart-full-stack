import Flex from '../common/Flex';
import Typo from '../common/Typo';
import View from '../common/View';

export default function CartEmptyTemplate() {
  return (
    <View>
      <Flex.Column>
        <Typo as="h1" size="xl" weight="bold">
          장바구니
        </Typo>
      </Flex.Column>
      <Flex alignItems="center" justifyContent="center" flexGrow={1}>
        <Typo>장바구니에 담은 상품이 없습니다.</Typo>
      </Flex>
    </View>
  );
}
