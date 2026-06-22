import Flex from '../common/Flex';
import Spinner from '../common/Spinner';
import Typo from '../common/Typo';
import View from '../common/View';

export default function CartSkeletonTemplate() {
  return (
    <View>
      <Flex.Column>
        <Typo as="h1" size="xl" weight="bold">
          장바구니
        </Typo>
      </Flex.Column>
      <Flex alignItems="center" justifyContent="center" flexGrow={1}>
        <Spinner />
      </Flex>
    </View>
  );
}
