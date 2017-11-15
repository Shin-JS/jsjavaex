package p02.clone;

import java.util.Arrays;
import java.util.Objects;

/**[API]
 * -.기본데이터 타입의 값 비교는 Wrapper타입이 참조하는 번지비교이지만, 기본데이터 타입의 값은 constant 리터럴
 *   숫자인경우, 상수풀에 하나의 리터럴이 생성되고 그것을 참조함, 숫자는 동일한 참조가됨
 * -.비교할 두 객체가 Array인 경우, deepEquals()메소드로 두 배열의 내용을 비교할 수 있음,
 *   Arrays.deepEquals()가 동일한 결과가 나옴
 **/
public class EqualsAndDeepEquals {
	public static void main(String[] args) {
		Integer o1 = 1000; //int타입의 1000이 Integer타입으로 대입됨
		Integer o2 = 1000;
		System.out.println(Objects.equals(o1,o2)); //객체의 주소번지 비교
		System.out.println(Objects.equals(o1, null));
		System.out.println(Objects.equals(null, o2));
		System.out.println(Objects.equals(null, null));
		System.out.println(Objects.deepEquals(o1, o2)); //객체의 내용 비교
		
		System.out.println("========================");
		
		Integer[] arr1 = {1,2};
		Integer[] arr2 = {1,2};
		
		System.out.println(Objects.equals(arr1, arr2));
		System.out.println(Objects.deepEquals(arr1, arr2));
		System.out.println(Arrays.deepEquals(arr1, arr2)); //배열의 요소들의 내용이 같은지 비교하는 메소드
		System.out.println(Objects.deepEquals(null, arr2));
		System.out.println(Objects.deepEquals(arr1, null));
		System.out.println(Objects.deepEquals(null, null));
		
	}
}
