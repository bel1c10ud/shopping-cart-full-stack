import Flex from '../common/Flex';
import Typo from '../common/Typo';
import View from '../common/View';

export default function CartErrorTemplate() {
  return (
    <View>
      <Flex direction="column">
        <Typo as="h1" size="xl" weight="bold">
          장바구니
        </Typo>
      </Flex>
      <Flex alignItems="center" justifyContent="center" flexGrow={1}>
        <Typo>에러가 발생했습니다.</Typo>
      </Flex>
    </View>
  );
}
