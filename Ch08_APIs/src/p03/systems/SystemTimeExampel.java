package p03.systems;
/**[API]
 * 
 **/
public class SystemTimeExampel {
	public static void main(String[] args) {
		long time1 = System.nanoTime();
		//이 시점의 시각을 나노초로 출력 - timeStamp역할
		int sum = 0;
		for (int i = 1; i <= 100000; i++) {
			sum+=i;
		}//합
		long time2 = System.nanoTime();
		//이 시점의 시각을 nanosec로 출력
		System.out.println("1~100000까지의 합: " +sum);
		System.out.println("걸린 시각: "+(time2-time1)+"nanosec");
	}
}
