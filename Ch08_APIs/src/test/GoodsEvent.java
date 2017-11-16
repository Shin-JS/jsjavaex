package test;

import java.time.LocalDate;

public class GoodsEvent {
	Goods goods;
	LocalDate startDate;
	LocalDate endDate;
	LocalDate localDate;
	//생성자
	public GoodsEvent(Goods goods, LocalDate startDate, LocalDate endDate) {
		this.goods = goods;
		this.startDate = startDate;
		this.endDate = endDate;
	}
	//메소드
	public Goods getGoods() {
		return goods;
	}
	public void setGoods(Goods goods) {
		this.goods = goods;
	}
	public LocalDate getStartDate() {
		return startDate;
	}
	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}
	public LocalDate getEndDate() {
		return endDate;
	}
	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}
	public void events(LocalDate localDate) {
		if((localDate.isAfter(startDate)||localDate.isEqual(startDate))&&(localDate.isBefore(endDate)||localDate.isEqual(endDate))) {
			goods.setPrice((goods.getPrice()*8/10)); //long타입이라 0.8을 그냥 곱할 수 없었음...
			System.out.println("제품명: "+ goods.getName() + ", 가격: " + goods.getPrice());
		}else {
			System.out.println("제품명: "+ goods.getName() + ", 가격: " + goods.getPrice());
		}
		
	}
	
}
