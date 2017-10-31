package p01.references;

public class ArrExample4 {
	public static void main(String[] args) {
		int[] a = {85,90,75,100,95}; //초기값으로 배열 객체 생성
		int sum = 0;
		double avg;
		for (int i = 0; i<a.length;i++) {
			sum+=a[i];
		}
		avg = sum/a.length;
		System.out.println("합계="+sum);
		System.out.println("평균="+avg);
		System.out.println("-------------------------");
		//향상된 for문
		sum = 0;
		for(int k:a) { //(타입변수:객체) 선언된 변수는 {여기서 사용}
			sum+=k;
		}avg = sum/a.length;
		System.out.println("합계="+sum);
		System.out.println("평균="+avg);
	}
}
