package p02.standardApi;

import java.util.function.IntBinaryOperator;
/**
 * Operator 함수적 인터페이스: 동일한 타입의 데이터 연산을 하는 추상메소드 
 **/
public class OperatorExample {
	private static int[] scores = {92,95,87};
	public static int maxOrMin(IntBinaryOperator operator) {
		int result = scores[0];
		for (int score:scores) {
			result = operator.applyAsInt(result, score);
		}
		return result;
	}
	
	public static void main(String[] args) {
		int max = maxOrMin((a,b)->a>=b?a:b);
		System.out.println(max);
		int min = maxOrMin((a,b)->a<=b?a:b);
		System.out.println(min);
	}
}
