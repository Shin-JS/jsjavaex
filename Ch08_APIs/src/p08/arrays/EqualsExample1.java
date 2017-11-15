package p08.arrays;

import java.util.Arrays;

/**[API]
 * 배열의 복사
 **/
public class EqualsExample1 {
	public static void main(String[] args) {
		int[][] origin = {{1,2},{3,4}};
		
		//얕은복제
		System.out.println("[얕은복제 후 비교]");
		int[][] cloned1 = Arrays.copyOf(origin, origin.length);
		System.out.println("배열 번지 비교: " + origin.equals(cloned1));
		System.out.println("1차배열 항목값 비교: "+Arrays.equals(origin, cloned1));
		System.out.println("중첩 배열 항목값 비교: "+ Arrays.deepEquals(origin, cloned1));
		
		//깊은복제
		System.out.println("[깊은복제 후 비교]");
		int[][] cloned2 = Arrays.copyOf(origin, origin.length); //얕은복제
		cloned2[0] = Arrays.copyOf(origin[0], origin[0].length); //이 과정이 추가되었음(깊은복제)
		cloned2[1] = Arrays.copyOf(origin[1], origin[1].length); //중첩된 배열의 값을 새로 써주는과정
		System.out.println("배열 번지 비교: "+ origin.equals(cloned2));
		System.out.println("1차배열 항목값 비교: "+ Arrays.equals(origin, cloned2));
		System.out.println("중첩 배열 항목값 비교: " + Arrays.deepEquals(origin, cloned2));
	}
}
