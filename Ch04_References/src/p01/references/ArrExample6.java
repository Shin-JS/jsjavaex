package p01.references;
/**
 * 배열에서 최대값, 최소값 구하기 
 **/
public class ArrExample6 {
	public static void main(String[] args) {
		int[] num = {76,45,34,89,100,50,90,92};
		int sum = 0;
		int max = 0; //최대값이 들어갈 변수의 초기값은 배열의 요소들보다 현저하게 작은값을 저장
		int min = 120; //최소값이 들어갈 변수의 초기값은 배열의 요소들보다 현저하게 큰값을 저장
		for (int i = 0; i < num.length; i++) {
			sum+=num[i]; //배열의 합계 구하기
			if (num[i]>max) {
				max = num[i];
			}
			if (num[i]<min) {
				min = num[i];
			}
		}
		System.out.println("sum:"+sum);
		System.out.println("avgt:"+sum/num.length);
		System.out.println("max:"+max);
		System.out.println("min:"+min);
	}
}
